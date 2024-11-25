'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Info, MessageCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EditInstructionsModal } from './EditInstructionsModal'
import type { Character } from '@/types/character'

interface CharacterCardProps {
  character: Character
  onStartChat: (character: Character) => void
  onViewPrompt: (character: Character) => void
}

export function CharacterCard({ character, onStartChat, onViewPrompt }: CharacterCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentCharacter, setCurrentCharacter] = useState(character)

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setCurrentCharacter(updatedCharacter)
  }

  return (
    <>
      <div className="w-full h-full flex flex-col bg-[#FFD3E3]">
        <div className="flex flex-col h-full p-6 justify-between">
          {/* Top Section - Avatar and Name */}
          <div className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={currentCharacter.image} alt={currentCharacter.name} />
              <AvatarFallback>{currentCharacter.name[0]}</AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-bold text-[#37001F] text-center">{currentCharacter.name}</h3>
            <p className="text-sm text-[#F05627] text-center mt-1">{currentCharacter.role}</p>
          </div>

          {/* Middle Section - Description and Topics */}
          <div className="flex flex-col items-center py-6">
            <p className="text-sm text-gray-600 text-center mb-4 max-w-sm">
              {currentCharacter.description}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {currentCharacter.topics.map((topic, index) => (
                <span 
                  key={index} 
                  className="px-4 py-1.5 text-sm rounded-full border border-[#37001F] text-[#37001F] bg-transparent"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Section - Buttons */}
          <div className="flex flex-col gap-3 mt-auto pb-2">
            <Button 
              variant="outline" 
              className="w-full hover:bg-[#37001F]/5 border-0 h-14 text-base"
              onClick={() => setIsEditOpen(true)}
            >
              <Info className="w-5 h-5 mr-2" />
              Finetune me
            </Button>
            <Button 
              className="w-full bg-[#37001F] hover:bg-[#F05627] text-white border-0 h-14 text-base" 
              onClick={() => onStartChat(currentCharacter)}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat with {currentCharacter.name}
            </Button>
          </div>
        </div>
      </div>

      <EditInstructionsModal
        character={currentCharacter}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onUpdate={handleUpdateCharacter}
      />
    </>
  )
} 