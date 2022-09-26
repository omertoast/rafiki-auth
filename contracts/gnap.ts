import GrantService from '../app/oldServices/grant'
import ClientService from '../app/oldServices/client'

declare module '@ioc:Gnap/GrantService' {
  const GrantService: GrantService
  export default GrantService
}

declare module '@ioc:Gnap/ClientService' {
  const ClientService: ClientService
  export default ClientService
}
