import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { hash } from 'bcryptjs'

import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /sessions', async () => {
    // Create a user
    await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@email.com',
        password: await hash('123456', 8),
      },
    })

    // Try to authenticate
    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'johndoe@email.com',
      password: '123456',
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      accessToken: expect.any(String),
    })
  })
})
