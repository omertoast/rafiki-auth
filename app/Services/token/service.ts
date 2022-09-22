import AccessToken from 'App/Models/AccessToken'
import crypto from 'crypto'
import { v4 } from 'uuid'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import GrantAccess from 'App/Models/GrantAccess'
import { GrantState } from 'App/Models/Grant'

interface ServiceDependencies {
	DefaultTokenExpirySeconds: number
}

interface ServiceOptions {
	DefaultTokenExpirySeconds: number
}

export interface TokenService {
	create: (opts: CreateTokenOptions) => Promise<AccessToken>,
	rotate: (opts: RotateTokenOptions) => Promise<unknown>,
	revoke: (opts: RevokeTokenOptions) => Promise<string>, // returns managementId
	introspect: (opts: IntrospectTokenOptions) => Promise<unknown>
}

export const NewService = async (opts?: ServiceOptions): Promise<TokenService> => {
	const deps: ServiceDependencies = {
		DefaultTokenExpirySeconds: opts?.DefaultTokenExpirySeconds || 600
	}

	return {
		create: (opts: CreateTokenOptions) => createToken(deps, opts),
		rotate: (opts: RotateTokenOptions) => rotateToken(deps, opts),
		revoke: (opts: RevokeTokenOptions) => revokeToken(opts),
		introspect: (opts: IntrospectTokenOptions) => introspectToken(opts)
	}
}

interface CreateTokenOptions {
	grantId: string,
	trx?: TransactionClientContract,
	expirySeconds?: number
}

const createToken = async (deps: ServiceDependencies, opts: CreateTokenOptions) => {
	return await AccessToken.create({
		grantId: opts.grantId,
		value: crypto.randomBytes(8).toString('hex').toUpperCase(),
		managementId: v4(),
		expiresIn: opts?.expirySeconds || deps.DefaultTokenExpirySeconds // should we store expiresIn as seconds or milliseconds?
	}, {client: opts?.trx})
}

interface RevokeTokenOptions {
	managementId: string,
	trx?: TransactionClientContract
}

const revokeToken = async (opts: RevokeTokenOptions): Promise<string> => {
	const token = await AccessToken.findByOrFail('managementId', opts.managementId, {client: opts.trx})
	await token.delete()

	return token.managementId
}

interface RotateTokenOptions {
	managementId: string,
	trx?: TransactionClientContract
}

const rotateToken = async (deps: ServiceDependencies, opts: RotateTokenOptions) => {
	const token = await AccessToken.findByOrFail('managementId', opts.managementId, {client: opts.trx})
	await token.delete()

	const newToken = await createToken(deps, {
		grantId: token.grantId,
		trx: opts.trx,
		expirySeconds: token.expiresIn
	})

	const access = await GrantAccess.findByOrFail('grantId', token.grantId, {client: opts.trx})

	return {
		success: true,
		access,
		value: newToken.value,
		managementId: newToken.managementId,
		expiresIn: newToken.expiresIn
	}
}

interface IntrospectTokenOptions {
	value: string,
	trx?: TransactionClientContract
}

const introspectToken = async (opts: IntrospectTokenOptions) => {
	const token = await AccessToken.findByOrFail('value', opts.value, {client: opts.trx})
	
	if (isTokenExpired(token)) return { active: false}
	if (token.grant.state === GrantState.Revoked) return { active: false}

	return {
		active: true,
		...token.grant
	}
}

const isTokenExpired = (token: AccessToken): boolean => {
  const now = new Date(Date.now())
  const expiresAt = token.createdAt.get('millisecond') + token.expiresIn*1000
  return expiresAt < now.getTime()
}
