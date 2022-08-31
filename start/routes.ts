/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

// Admin Routes
Route.resource('grant', 'GrantsController').apiOnly()
Route.resource('token', 'TokensController').apiOnly()
Route.resource('interaction', 'InteractionController').apiOnly()

// GNAP
Route.group(() => {
  Route.post('/', 'GnapController.requestGrant')
  Route.post('/continue/:continueId', 'GnapController.continueGrant')
  Route.patch('/continue/:continueId', 'GnapController.updateGrant')
  Route.delete('/continue/:continueId', 'GnapController.revokeGrant')
  Route.post('/token/:token', 'GnapController.rotateToken' )
  Route.delete('/token/:token', 'GnapController.revokeToken' )
}).prefix('/gnap')

Route.group(() => {
  Route.get('/', 'IntrospectController.introspect')
}).prefix('/introspect')


