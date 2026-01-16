// Import the framework and instantiate it
import Fastify from 'fastify'
import streamYoutubeURL from './components/getStreamURL'

const fastify = Fastify({
    logger: true
})

// Declare a route
fastify.get('/info', async function download() {
    // /info
    console.log('Request für /info erhalten')
})

fastify.get('/request-play', async function download() {
    // GET /request-play?identifier=dQw4w9WgXcQ&just-download=false&save-while-streaming=true&downloaded-callback=http://jimce-server:8080/api/downlaoded-callback/67as0fhufuiashiu
    console.log('Request für /request-play erhalten')
})

fastify.get('/stream', async function download() {
    // GET /stream?id=[uuid]
    console.log('Request für /stream erhalten')
    await streamYoutubeURL()
})

fastify.get('/download', async function download(request, reply) {
    // GET /download?id=[uuid]
    console.log('Request für /download erhalten')

    const youtubeURL = request.query as { youtubeURL?: string }
    if (!youtubeURL) {
        return reply.status(400).send({ error: 'Keine URL angegeben' })
    }

    console.log('YouTube-URL:', youtubeURL)
    return { success: true, youtubeURL }
})

fastify.get('/api/ping', async function ping(req, res) {
    res.status(200).send('pong')
})

// Run the server!
try {
    await fastify.listen({ port: 4002 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}
