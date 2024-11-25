import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const characters = await prisma.character.findMany({
      include: {
        instructionBlocks: true,
      },
    })
    return NextResponse.json(characters)
  } catch (error) {
    console.error('Error fetching characters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const character = await prisma.character.create({
      data: {
        name: body.name,
        role: body.role,
        image: body.image,
        description: body.description,
        topics: body.topics,
        instructionBlocks: {
          create: body.instructionPrompt.map((block: any) => ({
            content: block.content,
            isActive: block.isActive,
          })),
        },
      },
      include: {
        instructionBlocks: true,
      },
    })
    return NextResponse.json(character)
  } catch (error) {
    console.error('Error creating character:', error)
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    )
  }
} 