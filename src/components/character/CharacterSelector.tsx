'use client'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CharacterCard } from './CharacterCard'
import type { Character } from '@/types/character'

interface CharacterSelectorProps {
  characters: Character[]
  onStartChat: (character: Character) => void
  onViewPrompt: (character: Character) => void
}

export function CharacterSelector({ characters, onStartChat, onViewPrompt }: CharacterSelectorProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const cycleCharacter = (direction: number) => {
    setCurrentIndex((prev) => (prev + direction + characters.length) % characters.length)
  }

  return (
    <div className="flex items-center justify-center gap-8 p-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => cycleCharacter(-1)}
        className="rounded-full hover:bg-white/20"
      >
        <ChevronLeft className="h-8 w-8 text-[#37001F]" />
      </Button>

      <div className="relative w-[400px] h-[550px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0"
          >
            <CharacterCard
              character={characters[currentIndex]}
              onStartChat={onStartChat}
              onViewPrompt={onViewPrompt}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => cycleCharacter(1)}
        className="rounded-full hover:bg-white/20"
      >
        <ChevronRight className="h-8 w-8 text-[#37001F]" />
      </Button>
    </div>
  )
} 