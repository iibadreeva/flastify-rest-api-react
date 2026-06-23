import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

// Генерация OpenAPI-спеки и визуальный UI.
// Оборачиваем в fastify-plugin, чтобы хук onRoute работал на корневом уровне
// и @fastify/swagger «видел» роуты, регистрируемые в других плагинах/папке routes.
export default fp(async (fastify) => {
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'Flastify REST API',
                description: 'API курсов, уроков и пользователей',
                version: '1.0.0',
            },
            components: {
                securitySchemes: {
                    // bearerAuth ссылается на @fastify/jwt: токен передаётся
                    // заголовком `Authorization: Bearer <token>`.
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
            tags: [
                { name: 'courses', description: 'Курсы' },
                { name: 'lessons', description: 'Уроки' },
                { name: 'users', description: 'Пользователи' },
            ],
        },
    })

    await fastify.register(swaggerUi, {
        routePrefix: '/documentation',
    })
})
