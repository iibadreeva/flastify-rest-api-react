import { faker } from '@faker-js/faker'

export function buildUser(params = {}) {
    const user = {
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
    }

    return Object.assign({}, user, params)
}

export function buildCourse(params = {}) {
    const user = {
        creatorId: null,
        name: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
    }

    return Object.assign({}, user, params)
}

export function buildCourseLesson(params = {}) {
    const lesson = {
        courseId: null,
        name: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
    }

    return Object.assign({}, lesson, params)
}