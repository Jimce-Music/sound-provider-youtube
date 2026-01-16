import { checkDependencies } from './check_dependencies'
import { checkJimceServerConnection } from './check_jimce_connection'

console.log('Dependencies check started...')
await checkDependencies()

console.log('Ping Jimce Server...')
await checkJimceServerConnection()
