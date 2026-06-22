import fp from 'fastify-plugin'
import sensible from '@fastify/sensible'

// Добавляет полезные утилиты и удобные HTTP-ошибки (fastify.httpErrors).
export default fp(async (fastify) => {
    fastify.register(sensible)
})
