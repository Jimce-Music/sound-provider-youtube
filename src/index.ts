// Import the framework and instantiate it
import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.get('/info', async function download () {           // /info
                                                            // {
                                                            //   "name": "jimce-music/sound-provider-youtube",
                                                            //   "license": "MIT",

                                                            //   "provider-type": "youtube",
                                                            //   "expected-sound-quality": "medium",

                                                            //   "best-for": {
                                                            //     "streaming": true,
                                                            //     "downloads": false
                                                            //   },

                                                            //   "capabilities": {
                                                            //     "streaming": [true, "/stream"],
                                                            //     "downloads": [true, "/download"]
                                                            //   },

                                                            //   "accepted-identifiers": ["youtube:id", "youtube:url"]
                                                            // }
    console.log("Request für /info erhalten");
    return { hello: '/info' }
})

fastify.get('/request-play', async function download () {   // GET /request-play?identifier=dQw4w9WgXcQ&just-download=false&save-while-streaming=true&downloaded-callback=http://jimce-server:8080/api/downlaoded-callback/67as0fhufuiashiu
    console.log("Request für /request-play erhalten");
    return { hello: '/request-play'}
})

fastify.get('/stream', async function download () {         // GET /stream?id=[uuid]
    console.log("Request für /stream erhalten");
    return { hello: '/stream' }
})

fastify.get('/download', async function download () {       // GET /download?id=[uuid]
    console.log("Request für /download erhalten");
    return { hello: '/download' }
})

// Run the server!
try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}