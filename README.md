# Open Payments Authorization Server

The Open Payments APIs leverage the Grant Negotiation and Authorization (GNAP) standard.

This server is an implementation of a GNAP authorization server (AS) specifically for Open Payments.
- https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol

The AS is an essential component of a GNAP (Grant Negotiation and Authorization Protocol) system. Clients wishing to access APIs at a resource server (RS) must request a grant from the AS first. If necessary the AS will require the client to get authorization from the resource owner (RO) before issuing the grant.

Open Payments uses a limited profile of GNAP, only supporting a limited set of interaction modes, key types, signature algorithms and client identification mechanisms.

The GNAP APIs implemented by the server are documented in an Open API specification here:
- https://github.com/interledger/open-payments/blob/master/auth-server-open-api-spec.yaml

## Interfaces

This implementation of an AS has 4 interfaces:
 1. A public GNAP AS interface through which clients request and negotiate the issuance of grants.
 2. A private interface used by an identity provider that is able to authenticate resource owners (RO) and present them with the details of a grant request so that they can provide their consent to the issuance of the grant.
 3. A private interface through which an RS can introspect tokens issued by the AS to get the details of the grant and client.
 4. A private admin interface through which internal systems can administer the grants, tokens, clients and keys.

### Public - Standard GNAP AS interface

The public interface follows the GNAP standard. It is hosted at the path prefix `/gnap` and includes the following routes:

`POST /`

The grant request initiation API. A client will POST a grant request to this endpoint to start a new grant request.

The AS will either respond with an access token for the requested grant or with details the client can use to continue the grant negotiation.

`POST /continue/:id`
`PATCH /continue/:id`
`DELETE /continue/:id`

The continuation APIs are where a client can continue with a previous grant request that was initiated via the base API.

Almost all GNAP responses will contain a `continue` element with details of how to continue the grant request. This could involve continuing a grant that is pending resource owner interaction, updating the requested access permissions, or revoking the grant.

`POST /token/:id`
`DELETE /token/:id`

The token route is where a client can rotate or revoke a token that was issued for a grant.

This endpoint URL is returned in GNAP responses where an access token is issued. It is the token management URL.

### Private - Token Introspection API

The introspection API is used by an RS to get the details of a token including the associated grant and client.

`GET /introspect/:id`

### Public & Private - Interactions

The interactions APIs are used to handle redirect interactions between the client, the AS and the RO.

When the AS requires the client to redirect an RO to start an interaction it first directs the RO an endpoint hosted by the AS where it sets a cookie to ensure the interaction is all done via the same device.

The AS immediately redirects the RO to an identity provider (IdP) where the RO is authenticated and consents to (or declines) the permissions requested by the client. The IdP uses the backend consent API to record the RO's decision before redirecting them back to the AS where their session is checked and they are redirected back to the client.

There are two public APIs which handle the front-channel interactions and two private APIs which handle the backend interactions between the AS and the IdP.

The front-channel APIs are prefixed `frontend` and the backend APIs `backend` to make it easier to define load-balancer and ingress rules for them.

`GET /frontend/interact/:id/start/:nonce`

Start an interaction. This API is intended to be accessed via the front-channel (i.e. requests come directly from the RO's browser) and will always return a redirect response.

When the RO visits this URL the AS puts a cookie onto the browser to ensure that the same browser is used to finish the interaction.

`GET /frontend/interact/:id/finish/:nonce`

Finish an interaction. This API is intended to be accessed via the front-channel (i.e. requests come directly from the RO's browser) and will always return a redirect response.

When the RO visits this URL the AS checks the cookie in the request to ensure that the same browser is used to finish the interaction.

`POST /backend/interact/:id/start/:nonce`

Start an interaction. This API is intended to be accessed via the backend by the IdP and must be authenticated.

This API is used to get the details of the grant that has been requested.

`POST /backend/interact/:id/finish/:nonce`

Finish an interaction. This API is intended to be accessed via the backend by the IdP and must be authenticated.

This API is used to post the details of RO's input on the consent screen.


## Local Development

The application is built on [AdonisJS](https://docs.adonisjs.com/).

It can be setup by simply running pnpm install 

```shell
pnpm i
```

Use [ACE](https://docs.adonisjs.com/guides/ace-commandline) to run a dev server with a local Sqlite DB.

```shell
node ace serve -w  
```

## Tests

Test use the built-in [Japa](https://japa.dev/) test runner

```shell
node ace test
```

## Docker build

TODO
