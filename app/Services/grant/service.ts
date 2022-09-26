import Database from '@ioc:Adonis/Lucid/Database'
import { randomBytes } from 'crypto'
import Client from 'App/Models/Client'
import Grant, { GrantState } from 'App/Models/Grant'
import {
  AccessRequest,
  AccessType,
  ErrorCode,
  InteractionState,
  InteractRequest,
  StartMethod,
} from '../types'
import AccessToken from 'App/Models/AccessToken'
import { DateTime } from 'luxon'
import GnapException from 'App/Exceptions/GnapException'
import GrantAccess from 'App/Models/GrantAccess'

interface ServiceDependencies {
  globallySupportedInteractionMethods: StartMethod[]
}

interface ServiceArgs {}

export interface GrantService {
  sayHello: (name: string) => Promise<string>
}

export const NewService = async (): Promise<GrantService> => {
  return {
    sayHello: async (name: string) => {
      return `Hello ${name}`
    },
  }
}

/**
 * Initialize a grant request based on the requested access permissions and interaction options
 *
 * @param client the current client
 * @param interact the interaction request from the client
 */
const initializeGrantNegotiation = async (
  client: Client,
  accessRequests: AccessRequest[],
  interact?: InteractRequest
): Promise<Grant> => {
  // Save the grant and accesses to the DB
  const trx = await Database.transaction()
  const grant = new Grant().useTransaction(trx)

  grant.clientId = client.id
  grant.state = GrantState.Processing

  if (interact) {
    grant.supportedStartMethods = interact.start

    if (interact.finish) {
      grant.finishMethod = interact.finish.method
      grant.finishUri = interact.finish.uri
      grant.finishNonce = interact.finish.nonce
    }
  }
  grant.save()

  await Promise.all(
    accessRequests.map(async (access) => {
      await grant.related('accesses').create(access)
    })
  )

  // Add interact options
  await trx.commit()

  return grant
}

/**
 * Assess if a grant requires interaction before it can be approved.
 *
 * @param grant the grant to be assessed
 * @returns an assessment result
 */
const assessAccessRequests = async (grant: Grant): Promise<AccessRequestResult> => {
  const accessRequests = await grant.related('accesses').query().exec()
  let allApproved = true
  const interactionsRequired = new Set<StartMethod>()

  for (const accessRequest of accessRequests) {
    const { approved, denied, interactionOptions } = await _assessAccessRequest(accessRequest)

    if (denied) {
      // If any of the access requests are outright denied, deny the whole grant request
      return {
        denied,
        approved: false,
        interactionOptions: [],
      }
    }
    allApproved = allApproved && approved
    interactionOptions.forEach((method) => {
      interactionsRequired.add(method)
    })
  }

  return {
    approved: allApproved,
    denied: false,
    interactionOptions: Array.from(interactionsRequired),
  }
}

/**
 * Assess if a single access request requires interaction and return the methods that can be tried
 *
 * If no interaction is required it will return an empty array
 *
 * If the access request can't be granted, even with an interaction the method throws
 *
 * @param grant the grant to be assessed
 * @returns an array of interaction methods, one of which must be completed to approve the grant
 * @param accessRequest
 * @returns
 */
const _assessAccessRequest = async (
  deps: ServiceDependencies,
  accessRequest: GrantAccess
): Promise<AccessRequestResult> => {
  // TODO - Evaluate the access requests and decide which interactions are required

  // Reject all outgoing payment requests
  if (accessRequest.type === AccessType.OutgoingPayment) {
    return {
      approved: false,
      denied: true,
      interactionOptions: [],
    }
  }

  // Implicitly approve incoming payment requests
  if (accessRequest.type === AccessType.IncomingPayment) {
    return {
      approved: true,
      denied: false,
      interactionOptions: [],
    }
  }

  return {
    approved: false,
    denied: false,
    interactionOptions: deps.globallySupportedInteractionMethods,
  }
}

/**
 * Perform any processing that is required on the grant
 *
 * If the grant is not in the 'processing' state then this will simply return
 *
 * @param grant
 * @returns
 */
const processGrant = async (grant: Grant) => {
  if (grant.state === GrantState.Processing) {
    const { approved, denied, interactionOptions } = await assessAccessRequests(grant)
    const interactions = await grant.related('interactions').query().exec()
    const approvedInteractions = interactions.filter(
      (interaction) =>
        interaction.state === InteractionState.Approved && interaction.finishedAt !== undefined
    )
    if (approved || approvedInteractions.length > 0) {
      grant.state = GrantState.Approved
      return
    }
    const deniedInteractions = interactions.filter(
      (interaction) =>
        interaction.state === InteractionState.Denied && interaction.finishedAt !== undefined
    )
    if (denied || deniedInteractions.length > 0) {
      // Client has finished an interaction and denied it.
      // This grant negotiation is over so let's move to finalized
      grant.state = GrantState.Finalized
      return
    }

    const pending = interactions.filter(
      (interaction) => interaction.state === InteractionState.Pending
    )
    if (pending.length === 0) {
      if (interactionOptions.length === 0) {
        // No interaction options available
        grant.state = GrantState.Finalized
        return
      } else {
        let interactionPossible = false
        // Get interactions supported by the client and filter out those not supported by the AS
        for (const method of grant.supportedStartMethods) {
          if (interactionOptions.includes(method)) {
            // TODO - There should be a "provider" for each method
            let code: string | undefined = undefined
            if (method in [StartMethod.UserCode, StartMethod.UserCodeUri]) {
              code = Math.floor(Math.random() * 899999 + 100000).toString()
            }

            let uri: string | undefined = undefined
            if (method in [StartMethod.App, StartMethod.Redirect, StartMethod.UserCodeUri]) {
              // TODO - Get URL for interactions
              uri = ''
            }

            const reference = grant.finishMethod ? generateTokenString() : undefined
            await grant.related('interactions').create({
              method,
              state: InteractionState.Pending,
              code,
              uri,
              reference,
            })

            interactionPossible = true
          }
        }

        if (!interactionPossible) {
          // The client doesn't support any of the requiredInteraction methods
          grant.state = GrantState.Finalized
          return
        }
      }
    }
    // Some pending interactions still available
    grant.state = GrantState.Pending
    return
  }
}

/**
 * Explicitly mark an interaction as finished using the reference provided to the client using
 * the client's finish method.
 *
 * If an interaction is found with this reference that has not expired or already been finished then the grant
 * moves into the processing state and the interaction is finished.
 *
 * https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-continuing-after-a-complete
 *
 * @param grant the grant on which the interaction is being finished
 * @param reference the interact_ref passed by the client
 */
const finishInteraction = async (grant: Grant, reference: string) => {
  const interaction = await grant
    .related('interactions')
    .query()
    .where({
      reference,
      finishedAt: undefined,
    })
    .andWhere((query) => {
      query.whereRaw('expires_at > CURRENT_TIMESTAMP').orWhereNull('expiresAt')
    })
    .first()

  if (interaction) {
    const trx = await Database.transaction()

    interaction.useTransaction(trx)
    interaction.finishedAt = DateTime.now()
    await interaction.save()

    grant.useTransaction(trx)
    grant.state = GrantState.Processing
    await grant.save()

    await trx.commit()
    return
  } else {
    // Couldn't find the interaction for that reference
    throw new GnapException('Invalid interact_ref', ErrorCode.InvalidInteraction)
  }
}

/**
 * For grants where there is no finish method defined by the client, the client might poll to see if any
 * interaction have been completed.
 *
 * https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-continuing-during-pending-i
 *
 * @param grant the grant being polled
 */
const poll = async (grant: Grant) => {
  if (grant.finishMethod) {
    // We only allow polling if there is no finish method defined
    throw new GnapException(
      'Polling not permitted for this grant request. Wait for a finish reference',
      ErrorCode.InvalidRequest
    )
  }

  // Get interactions that are approved / denied but not yet finished
  const interactions = await grant
    .related('interactions')
    .query()
    .where({
      finishedAt: undefined,
    })
    .andWhere((query) => {
      query.where({ state: InteractionState.Approved }).orWhere({ state: InteractionState.Denied })
    })
    .andWhere((query) => {
      query.whereRaw('expires_at > CURRENT_TIMESTAMP').orWhereNull('expiresAt')
    })

  if (interactions.length > 0) {
    const trx = await Database.transaction()

    for (const interaction of interactions) {
      interaction.useTransaction(trx)
      interaction.finishedAt = DateTime.now()
      await interaction.save()
    }

    grant.useTransaction(trx)
    grant.state = GrantState.Processing
    await grant.save()

    await trx.commit()
    return
  }
}

/**
 * Check if a continue request has been received too soon since the last request based on the wait period that was returned to the client.
 * @param grant the grant request being continued
 */
const isTooFast = (grant: Grant): Promise<boolean> => {
  throw new Error('Function not implemented.')
}

const generateAccessToken = (grant: Grant, expiresIn?: number): Promise<AccessToken> => {
  return grant.related('accessTokens').create({
    value: generateTokenString(),
    expiresIn,
  })
}

/**
 * Refresh the access token for managing this grant request and reset the wait timeout for the next continue request
 *
 * @param grant The grant to be updated
 * @param wait The number of seconds to wait before a continue request will be accepted. Defaults to the application config.
 *
 * @returns the updated grant
 */
const refreshContinueToken = (grant: Grant, wait?: number): Promise<Grant> => {
  grant.continueToken = generateTokenString()
  return grant.save()
}

export function generateTokenString(length: number = 20): string {
  return randomBytes(length / 2)
    .toString('hex')
    .toUpperCase()
    .slice(0, length)
}

type AccessRequestResult = {
  /**
   * `true` if the access request is approved without interaction
   */
  approved: boolean
  /**
   * available interaction modes to get approval for the request
   */
  interactionOptions: StartMethod[]
  /**
   * `true` if the access request is denied without interaction
   */
  denied: boolean
}
