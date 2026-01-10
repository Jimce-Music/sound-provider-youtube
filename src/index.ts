// Import the framework and instantiate it
import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.get('/info', async function download () {
    console.log("Request für /info erhalten");
    return { hello: '/info' }
})

fastify.get('/request-play', async function download () {
    console.log("Request für /request-play erhalten");
    return { hello: '/request-play'}
})

fastify.get('/stream', async function download () {
    console.log("Request für /stream erhalten");
    return { hello: '/stream' }
})

fastify.get('/download', async function download () {
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