import { GnapIdentifyClientConfig } from '../app/Middleware/GnapIdentifyClient'
import { GnapSignatureValidationConfig } from '../app/Middleware/GnapSignatureValidation'
 
 /*
 |--------------------------------------------------------------------------
 | GNAP Config
 |--------------------------------------------------------------------------
 |
 | The config for GNAP middlewares etc
 |
 */
 const gnapConfig: GnapConfig = {
 
   middleware: {
    signature: {
      default: {
      }
    },
    client: {
      init: {
        method: 'body',
      },
      // TODO - This and the middleware implementation needs to be reviewed
      token: {
        method: 'token',
        dbIdColumnName: 'interact_id',
        dbTokenColumnName: 'continue_token',
        parameterName: 'interact'
      },
      continue: {
        method: 'token',
        dbIdColumnName: 'continue_id',
        dbTokenColumnName: 'continue_token',
        parameterName: 'continue'
      }
    },
   },
 }
 export default gnapConfig
 
 type GnapConfig = {
  middleware: {
    signature: {
      [config: string]: GnapSignatureValidationConfig
    },
    client: {
      [config: string]: GnapIdentifyClientConfig
    },
  }
 }