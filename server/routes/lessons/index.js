import { asc, eq } from 'drizzle-orm'

import { courseLessons } from '../../db/schema.js'

const perPage = 2

const listQuerystring = {
    type: 'object',
    properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
    },
}

const idParams = {
    type: 'object',
    required: ['id'],
    properties: {
        id: { type: 'integer' },
    },
}

export default async function (fastify) {
    // GET /lessons?page=2 — список с пагинацией
    fastify.get(
        '/',
        { schema: { querystring: listQuerystring } },
        async (request) => {
            const { page } = request.query

            return fastify.db.query.courseLessons.findMany({
                orderBy: asc(courseLessons.id),
                limit: perPage,
                offset: (page - 1) * perPage,
            })
        },
    )

    // GET /lessons/:id
    fastify.get(
        '/:id',
        { schema: { params: idParams } },
        async (request) => {
            const { id } = request.params

            const lesson = await fastify.db.query.courseLessons.findFirst({
                where: eq(courseLessons.id, id),
            })

            fastify.assert(lesson, 404, 'Урок не найден')

            return lesson
        },
    )
}
