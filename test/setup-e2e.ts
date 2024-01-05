import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

function generateUniqueDatabaseUrl(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable')
  }

  // Criando uma nova instância de URL a partir da URL de conexão com o banco de dados
  const url = new URL(process.env.DATABASE_URL)

  // Alterando o nome do schema
  url.searchParams.set('schema', schemaId)

  // Retornando a nova URL com o schema único
  return url.toString()
}

const schemaId = randomUUID()

beforeAll(async () => {
  const databaseUrl = generateUniqueDatabaseUrl(schemaId)

  // Sobrescrevendo a env DATABASE_URL com a variável acima
  process.env.DATABASE_URL = databaseUrl

  // Executando o comando de criação do schema
  execSync('npx prisma db push')
})

afterAll(async () => {
  // Executando o comando de drop do schema
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
