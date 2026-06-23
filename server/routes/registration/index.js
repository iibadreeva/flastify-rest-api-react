import { eq } from 'drizzle-orm'
import { users } from '../../db/schema.js'

const registerBody = {
    type: 'object',
    required: ['email'],
    additionalProperties: false,
    properties: {
        email: { type: 'string', format: 'email' },
        fullName: { type: 'string', minLength: 1 },
    },
}

export default async function (fastify) {
    // POST /registration — публичная регистрация: создаёт пользователя
    // и сразу выдаёт JWT, чтобы фронтенд мог войти без отдельного запроса.
    fastify.post(
        '/',
        { schema: { tags: ['auth'], body: registerBody } },
        async (request, reply) => {
            const { email, fullName } = request.body

            const existing = await fastify.db.query.users.findFirst({
                where: eq(users.email, email),
            })
            fastify.assert(!existing, 409, 'Пользователь с таким email уже существует')

            const [user] = await fastify.db.insert(users)
                .values({ email, fullName })
                .returning()

            const token = fastify.jwt.sign(
                { id: user.id, email: user.email },
                { expiresIn: '1h' },
            )

            return reply.code(201).send({ token, user })
        },
    )
}
