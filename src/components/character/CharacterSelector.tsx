'use client'
import React from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
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
  const [direction, setDirection] = React.useState(0)
  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const cycleCharacter = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => {
      const nextIndex = prev + newDirection
      if (nextIndex >= characters.length) return 0
      if (nextIndex < 0) return characters.length - 1
      return nextIndex
    })
  }

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x)

    if (swipe < -swipeConfidenceThreshold) {
      cycleCharacter(1)
    } else if (swipe > swipeConfidenceThreshold) {
      cycleCharacter(-1)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
      transition: {
        duration: 0.1,
      }
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    })
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-88px)]">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => cycleCharacter(-1)}
            className="hover:bg-white/20 z-10 transition-transform hover:scale-110"
          >
            <ChevronLeft className="h-8 w-8 text-[#37001F]" />
          </Button>

          <div className="relative w-[400px] h-[600px] perspective-1000">
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  transformStyle: 'preserve-3d',
                }}
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
            className="hover:bg-white/20 z-10 transition-transform hover:scale-110"
          >
            <ChevronRight className="h-8 w-8 text-[#37001F]" />
          </Button>
        </div>

        {/* Indicator Blocks */}
        <div className="flex gap-2 mt-2">
          {characters.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 cursor-pointer transition-colors ${
                index === currentIndex ? 'bg-[#37001F]' : 'bg-[#37001F]/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 