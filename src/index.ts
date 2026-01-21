// Import the framework and instantiate it
import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import getStreamYoutubeURL from './components/getStreamURL'
import requestPlay from './components/requestPlay'
import { plays, type PlayT, type PlaysStoreT } from './utils/PlaysStore'
import * as uuid from 'uuid'
import downloadYoutubeAudio from './components/download'
import type { BarBarEqualsToken } from 'typescript'

const fastify = Fastify({
    logger: true
})

// Set up CORS in dev mode
await fastify.register(fastifyCors, {
    origin: "*"
})

// Declare a route
fastify.get('/info', async (req, res) => {
    console.log('[Main] Request für /info erhalten')

    res.status(200).send({
        "success":true,

        "name":"jimce-music/sound-provider-youtube",
        "license":"MIT",

        "prvider-type":"youtube",
        "expected-sound-qualitiy":"medium",

        "best-for":{
            "streaming":true, 
            "downloads":false
        },

        "capabilities": {
            "streaming":[true, "/stream"],
            "downloads":[true, "/download"]
        },

        "accepted-identifiers":["youtube:id", "youtube:url"]
    })
})

fastify.get('/request-play', async (req, res) => {
    // GET /request-play?identifier=dQw4w9WgXcQ&just-download=false&save-while-streaming=true&downloaded-callback=http://jimce-server:8080/api/downlaoded-callback/67as0fhufuiashiu
    const query = req.query as {
        identifier?: string
        'just-download'?: string
        'save-while-streaming'?: string
        'downloaded-callback'?: string
    }

    if (!query.identifier || query.identifier.length <= 3) {
        return res.status(400).send('No identifier provided')
    }

    const youtubeId: string = typeof query.identifier === 'string' ? query.identifier : ''
    if (youtubeId.length <= 3) return res.status(400).send('No identifier provided')
    const justDownload = query['just-download'] === 'true'
    const saveWhileStreaming = query['save-while-streaming'] === 'true'
    const downloadedCallback = query['downloaded-callback']


    console.log('[Main] Request für /request-play erhalten')
    console.log('[Request-Play | Args | identifier]' + youtubeId)
    console.log('[Request-Play | Args | just-download]' + justDownload)
    console.log('[Request-Play | Args | save-while-streaming]' + saveWhileStreaming)
    console.log('[Request-Play | Args | downloaded-callback]' + downloadedCallback)

    const existingPlay = Object.values(plays).find(
        play => play.youtubeId === youtubeId
    )

    if (existingPlay) {
        //Restore Job
        return res.status(200).send({
            success: true,
            uuid: existingPlay.uuid
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
        uuid:playId
    })
})

fastify.get('/stream', async (req, res) => {
    // GET /stream?id=[uuid]
    const query = req.query as { id?: string }
    if (!query.id) return res.status(400).send('No uuid provided')
    const streamId: string = typeof query.id === 'string' ? query.id : ''
    if (streamId.length <= 3) return res.status(400).send('No uuid provided')

    console.log('[Main] Request für /stream erhalten')
    console.log(`[Stream | ID] ${streamId}`) // not the yt id, internal uuid
    
    const existingStreamJob = Object.values(plays).find(
        play => play.uuid === streamId
    )

    const youtubeStreamUrl = existingStreamJob?.downloadedCallback
    console.log('[Stream | STREAM_URL]' + youtubeStreamUrl)

    res.status(200).send({
        success: true,
        downloadedCallback:youtubeStreamUrl
    })
})

fastify.get('/download', async (req, res) => {
    // GET /stream?id=[uuid]
    const query = req.query as { id?: string }
    if (!query.id) return res.status(400).send('No uuid provided')
    const dlId: string = typeof query.id === 'string' ? query.id : ''
    if (dlId.length <= 3) return res.status(400).send('No uuid provided')

    console.log('[Main] Request für /download erhalten')
    console.log(`[Download | UUID] ${dlId}`) // not the yt id, internal uuid

    const existingDownloadJob = Object.values(plays).find(
        play => play.uuid === dlId
    )

    const youtubeDownloadUrl = existingDownloadJob?.youtubeId
    console.log(`[Download | DOWNLOAD_URL] ${youtubeDownloadUrl}`)

    if(!youtubeDownloadUrl) {
        console.error('[Download | DOWNLOAD_URL] !!! EMPTY !!!')
    }
    downloadYoutubeAudio(youtubeDownloadUrl ?? '')

    res.status(200).send({
        success: true
    })
})

fastify.get('/api/ping', async function ping(req, res) {
    console.log('[Main] Request für /api/ping erhalten')

    res.status(200).send('pong')
})

// Run the server
try {
    await fastify.listen({ port: 4002, host: '0.0.0.0' })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}
