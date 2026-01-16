// Import the framework and instantiate it
import Fastify from 'fastify'
import streamYoutubeURL from './components/getStreamURL'

const fastify = Fastify({
    logger: true
})

// Declare a route
fastify.get('/info', async (req, res) => {
    res.status(200).send({
        // JSON here
    })
})

fastify.get('/request-play', async (req, res) => {
    // GET /request-play?identifier=dQw4w9WgXcQ&just-download=false&save-while-streaming=true&downloaded-callback=http://jimce-server:8080/api/downlaoded-callback/67as0fhufuiashiu
    console.log(req.query) // JSON --> {identifier: '...', 'just-download': false, ...}
    res.status(200).send({
        // JSON here
    })
})

fastify.get('/stream', async (req, res) => {
    // GET /stream?id=[uuid]
    const query = req.query as { id?: string }
    if (!query.id) return res.status(400).send('No uuid provided')
    const streamId: string = typeof query.id === 'string' ? query.id : ''
    if (streamId.length <= 3) return res.status(400).send('No uuid provided')

    console.log('Request für /stream erhalten')
    console.log(`id: ${streamId}`) // not the yt id, internal uuid
    await streamYoutubeURL()

    res.status(200).send({
        // JSON here
    })
})

fastify.get('/download', async (req, res) => {
    // GET /stream?id=[uuid]
    const query = req.query as { id?: string }
    if (!query.id) return res.status(400).send('No uuid provided')
    const dlId: string = typeof query.id === 'string' ? query.id : ''
    if (dlId.length <= 3) return res.status(400).send('No uuid provided')

    console.log('Request für /download erhalten')
    console.log(`id: ${dlId}`) // not the yt id, internal uuid

    res.status(200).send({
        // JSON here
    })
})

fastify.get('/api/ping', async function ping(req, res) {
    res.status(200).send('pong')
})

// Run the server
try {
    await fastify.listen({ port: 4002 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}
