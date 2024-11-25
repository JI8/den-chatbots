'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Lock, Eye } from 'lucide-react'
import { Character } from '@/types/character'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EditInstructionsModal } from './EditInstructionsModal'
import { EditInstructionsModalAdmin } from './EditInstructionsModalAdmin'

interface ManageCharacterCardProps {
  character: Character
  onDelete: (id: string) => void
  onEdit: (character: Character) => void
}

export function ManageCharacterCard({ character, onDelete, onEdit }: ManageCharacterCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const totalInstructions = character.instructionPrompt?.length || 0

  const handleSaveEdit = (updatedCharacter: Character) => {
    onEdit(updatedCharacter)
    // The modal will close itself through onOpenChange
  }

  return (
    <>
      <div className="bg-white p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={character.image} alt={character.name} />
            <AvatarFallback>{character.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold text-[#37001F]">{character.name}</h3>
            <p className="text-[#F05627]">{character.role}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow space-y-5 mt-5">
          {/* Description */}
          <p className="text-gray-600 text-sm">
            {character.description}
          </p>

          {/* Topics */}
          <div className="flex flex-wrap gap-1.5">
            {character.topics.map((topic, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs border border-[#37001F] text-[#37001F] bg-transparent"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#37001F]" />
              <span className="text-xs text-gray-600">
                {totalInstructions} instructions
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
                className="text-[#37001F] hover:bg-[#FFE3ED] h-8"
                title="Preview public editor"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="text-[#37001F] hover:bg-[#FFE3ED] h-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(character.id)}
                className="text-red-500 hover:bg-red-50 h-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <EditInstructionsModal
        character={character}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onUpdate={() => {}}
        isAdminView={false}
      />

      {/* Edit Modal */}
      <EditInstructionsModalAdmin
        character={character}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={handleSaveEdit}
        mode="edit"
      />
    </>
  )
} 