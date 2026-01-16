// Import the framework and instantiate it
import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import getStreamYoutubeURL from './components/getStreamURL'
import requestPlay from './components/requestPlay'
import { plays, type PlayT, type PlaysStoreT } from './utils/PlaysStore'
import * as uuid from 'uuid'
import downloadYoutubeAudio from './components/download'

const fastify = Fastify({
    logger: true
})

// Set up CORS in dev mode
await fastify.register(fastifyCors, {
    origin: "*"
})

// Declare a route
fastify.get('/info', async (req, res) => {
    res.status(200).send({
        // JSON here
    })
})

fastify.get('/request-play', async (req, res) => {
    // GET /request-play?identifier=dQw4w9WgXcQ&just-download=false&save-while-streaming=true&downloaded-callback=http://jimce-server:8080/api/downlaoded-callback/67as0fhufuiashiu
    const query = req.query as { identifier?: string }
    if (!query.identifier) return res.status(400).send('No identifier provided')
    const youtubeId: string = typeof query.identifier === 'string' ? query.identifier : ''
    if (youtubeId.length <= 3) return res.status(400).send('No identifier provided')

    console.log('Request für /request-play erhalten')

    const existingPlay = Object.values(plays).find(
        play => play.youtubeId === youtubeId
    )

    if (existingPlay) {
        //Restore Job
        return res.status(200).send({
            success: true,
            uuid: existingPlay.uuid,
            created: existingPlay.created,
            youtubeId: existingPlay.youtubeId,
            downloadedCallback: existingPlay.downloadedCallback
        })
    }

    const playId = uuid.v4()
    plays[playId] = {
        uuid: playId,
        created: new Date(),
        youtubeId: youtubeId,
        downloadedCallback: await getStreamYoutubeURL(youtubeId)
    }

    res.status(200).send({
        success:true,
        uuid:playId,
        created: plays[playId].created,
        youtubeId: plays[playId].youtubeId,
        downloadedCallback:plays[playId].downloadedCallback
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
    const videoURL = ("https://www.youtube.com/watch?v=6EF64kAgtF4")
    const url = await getStreamYoutubeURL(videoURL)

    res.status(200).send({
      url:url
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
