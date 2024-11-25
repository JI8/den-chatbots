export interface Character {
  id: string
  name: string
  role: string
  image: string
  description: string
  topics: string[]
  instructionPrompt?: InstructionBlock[]
  instructionBlocks?: InstructionBlock[]
  createdAt?: Date
  updatedAt?: Date
}

export interface InstructionBlock {
  id: string
  content: string
  isActive: boolean
  isLocked?: boolean
  characterId?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Message {
  text: string
  sender: 'user' | 'ai'
} 