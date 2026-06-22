import { asc, eq } from 'drizzle-orm'

import { courses, courseLessons } from '../../db/schema.js'

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
    // GET /courses?page=2 — список с пагинацией
    fastify.get(
        '/',
        { schema: { querystring: listQuerystring } },
        async (request) => {
            const { page } = request.query

            return fastify.db.query.courses.findMany({
                orderBy: asc(courses.id),
                limit: perPage,
                offset: (page - 1) * perPage,
            })
        },
    )

    // GET /courses/:id — курс вместе с уроками
    fastify.get(
        '/:id',
        { schema: { params: idParams } },
        async (request) => {
            const { id } = request.params

            const course = await fastify.db.query.courses.findFirst({
                where: eq(courses.id, id),
            })

            fastify.assert(course, 404, 'Курс не найден')

            const lessons = fastify.db
                .select()
                .from(courseLessons)
                .where(eq(courseLessons.courseId, id))
                .all()

            return { ...course, lessons }
        },
    )
}
