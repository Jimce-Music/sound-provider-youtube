// index.ts
import { buildApp } from './app'

const start = async () => {
    const app = await buildApp()
    try {
        await app.listen({ port: 4002, host: '0.0.0.0' })
        console.log('Server running on http://0.0.0.0:4002')
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}
start()