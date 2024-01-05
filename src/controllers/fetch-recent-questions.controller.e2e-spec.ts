import request from 'supertest'
import { Test } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { INestApplication } from '@nestjs/common'

import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'

describe('Fetch recent questions (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    // Mock the JWT module
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /questions', async () => {
    // Create a user
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@email.com',
        password: '123456',
      },
    })

    // Generate a JWT token
    const accessToken = jwt.sign({ sub: user.id })

    // Create some questions
    await prisma.question.createMany({
      data: [
        {
          title: 'Simple title',
          content: 'Simple content',
          slug: 'simple-title',
          authorId: user.id,
        },
        {
          title: 'Simple title 2',
          content: 'Simple content 2',
          slug: 'simple-title-2',
          authorId: user.id,
        },
      ],
    })

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      questions: [
        expect.objectContaining({ title: 'Simple title' }),
        expect.objectContaining({ title: 'Simple title 2' }),
      ],
    })
  })
})
