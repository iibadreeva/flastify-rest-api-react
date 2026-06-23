import { eq } from 'drizzle-orm'
import { users } from '../../db/schema.js'

const loginBody = {
    type: 'object',
    required: ['email'],
    additionalProperties: false,
    properties: {
        email: { type: 'string', format: 'email' },
    },
}

export default async function (fastify) {
    // POST /tokens — вход по email. Возвращает JWT и данные пользователя.
    // (Пароля в этой учебной модели нет — достаточно существующего email.)
    fastify.post(
        '/',
        { schema: { tags: ['auth'], body: loginBody } },
        async (request, reply) => {
            const { email } = request.body

            const user = await fastify.db.query.users.findFirst({
                where: eq(users.email, email),
            })
            fastify.assert(user, 404, 'Пользователь не найден')

            const token = fastify.jwt.sign(
                { id: user.id, email: user.email },
                { expiresIn: '1h' }, // время протухания
            )

            return reply.code(201).send({ token, user })
        },
    )
}
