import { eq } from 'drizzle-orm'
import { users } from '../../db/schema.js'

export default async function (fastify) {
    fastify.post(
        '/tokens',
        async (request, reply) => {
            const user = await fastify.db.query.users.findFirst({
                // Добавить проверку пароля
                where: eq(users.email, request.body.email),
            })

            // Здесь должна быть проверка пароля (например, через bcrypt)
            fastify.assert(user, 404, 'User not found')

            const token = fastify.jwt.sign(
                { id: user.id, email: user.email },
                { expiresIn: '1h' }, // время протухания
            )
            return reply.code(201)
                .send({ token })
        },
    )
}