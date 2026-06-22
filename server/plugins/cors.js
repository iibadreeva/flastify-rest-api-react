import fp from 'fastify-plugin'
import cors from '@fastify/cors'

// Разрешает запросы с фронтенда (Vite dev-сервер и т.д.).
export default fp(async (fastify) => {
    fastify.register(cors, {
        origin: true,
    })
})
