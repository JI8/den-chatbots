'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Info, MessageCircle } from 'lucide-react'
import type { Character } from '@/types/character'

interface CharacterCardProps {
  character: Character
  onStartChat: (character: Character) => void
  onViewPrompt: (character: Character) => void
}

export function CharacterCard({ character, onStartChat, onViewPrompt }: CharacterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="p-6 bg-white/90 backdrop-blur-md shadow-xl rounded-3xl">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-[#FFE3ED]">
            <img 
              src={character.image} 
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-2xl font-bold text-[#37001F] mb-1">{character.name}</h3>
          <p className="text-sm text-[#F05627] mb-4">{character.role}</p>
          <p className="text-gray-600 text-center mb-4">{character.description}</p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {character.topics.map((topic, index) => (
              <span 
                key={index}
                className="px-3 py-1 rounded-full text-xs bg-[#FFE3ED] text-[#37001F]"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="flex flex-col w-full gap-2">
            <Button
              variant="outline"
              className="w-full border-[#37001F] text-[#37001F] hover:bg-[#FFE3ED]"
              onClick={() => onViewPrompt(character)}
            >
              <Info className="w-4 h-4 mr-2" />
              My Inner Workings
            </Button>
            <Button
              className="w-full bg-[#F05627] hover:bg-[#37001F] text-white"
              onClick={() => onStartChat(character)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat with {character.name}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 