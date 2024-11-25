import { PrismaClient } from '@prisma/client'
import { initialCharacters } from '../src/data/characters'

const prisma = new PrismaClient()

async function main() {
  // Delete existing data
  await prisma.message.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.instructionBlock.deleteMany()
  await prisma.character.deleteMany()

  // Seed characters
  for (const char of initialCharacters) {
    const character = await prisma.character.create({
      data: {
        name: char.name,
        role: char.role,
        image: char.image,
        description: char.description,
        topics: char.topics,
        instructionBlocks: {
          create: char.instructionPrompt.map(block => ({
            content: block.content,
            isActive: block.isActive
          }))
        }
      }
    })
    console.log(`Created character: ${character.name}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 