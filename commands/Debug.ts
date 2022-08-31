import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class Debug extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'debug'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Executes random code in the Debug.ts file'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest` 
     * afterwards.
     */
    loadApp: false,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call 
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    const { default: Client} = await import ('../app/Models/Client')
    const test = await Client.firstOrFail()
    this.logger.info(JSON.stringify(test.keys))
  }
}
