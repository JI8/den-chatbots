'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Character } from '@/types/character'
import { supabase } from '@/lib/supabase'
import { ManageCharacterCard } from './ManageCharacterCard'
import { EditInstructionsModalAdmin } from './EditInstructionsModalAdmin'

interface CharacterManagerProps {
  initialCharacters: Character[]
}

export function CharacterManager({ initialCharacters }: CharacterManagerProps) {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters)
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return
    
    try {
      // Delete instruction blocks first (cascade delete should handle this, but just to be safe)
      await supabase
        .from('instruction_blocks')
        .delete()
        .eq('character_id', id)

      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCharacters(prev => prev.filter(char => char.id !== id))
    } catch (error) {
      console.error('Error deleting character:', error)
    }
  }

  const handleSaveCharacter = async (updatedCharacter: Character) => {
    try {
      if (updatedCharacter.id) {
        // Update existing character
        const { error: charError } = await supabase
          .from('characters')
          .update({
            name: updatedCharacter.name,
            role: updatedCharacter.role,
            image: updatedCharacter.image,
            description: updatedCharacter.description,
            topics: updatedCharacter.topics,
          })
          .eq('id', updatedCharacter.id)

        if (charError) throw charError

        // Delete old instruction blocks
        await supabase
          .from('instruction_blocks')
          .delete()
          .eq('character_id', updatedCharacter.id)

        // Create new instruction blocks
        if (updatedCharacter.instructionPrompt) {
          const { error: blockError } = await supabase
            .from('instruction_blocks')
            .insert(
              updatedCharacter.instructionPrompt.map(block => ({
                character_id: updatedCharacter.id,
                content: block.content,
                is_active: true,
                is_locked: block.isLocked
              }))
            )

          if (blockError) throw blockError
        }

        // Fetch complete updated character
        const { data: completeChar, error: fetchError } = await supabase
          .from('characters')
          .select(`
            *,
            instruction_blocks (*)
          `)
          .eq('id', updatedCharacter.id)
          .single()

        if (fetchError) throw fetchError

        // Update local state
        setCharacters(prev => prev.map(char => 
          char.id === updatedCharacter.id ? {
            ...completeChar,
            instructionPrompt: completeChar.instruction_blocks.map((block: any) => ({
              id: block.id,
              content: block.content,
              isActive: block.is_active,
              isLocked: block.is_locked
            }))
          } : char
        ))
      } else {
        // Create new character
        const { data: newChar, error: charError } = await supabase
          .from('characters')
          .insert({
            name: updatedCharacter.name,
            role: updatedCharacter.role,
            image: updatedCharacter.image,
            description: updatedCharacter.description,
            topics: updatedCharacter.topics,
          })
          .select()
          .single()

        if (charError) throw charError

        // Create instruction blocks
        if (updatedCharacter.instructionPrompt) {
          const { error: blockError } = await supabase
            .from('instruction_blocks')
            .insert(
              updatedCharacter.instructionPrompt.map(block => ({
                character_id: newChar.id,
                content: block.content,
                is_active: true,
                is_locked: block.isLocked
              }))
            )

          if (blockError) throw blockError
        }

        // Fetch complete new character
        const { data: completeChar, error: fetchError } = await supabase
          .from('characters')
          .select(`
            *,
            instruction_blocks (*)
          `)
          .eq('id', newChar.id)
          .single()

        if (fetchError) throw fetchError

        // Add to local state
        setCharacters(prev => [...prev, {
          ...completeChar,
          instructionPrompt: completeChar.instruction_blocks.map((block: any) => ({
            id: block.id,
            content: block.content,
            isActive: block.is_active,
            isLocked: block.is_locked
          }))
        }])
      }

      setIsEditModalOpen(false)
      setEditingCharacter(undefined)
    } catch (error) {
      console.error('Error saving character:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 p-8">
      <div className="flex justify-end">
        <Button 
          className="bg-[#37001F] hover:bg-[#F05627] px-6"
          onClick={() => {
            setEditingCharacter(undefined)
            setIsEditModalOpen(true)
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Character
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {characters.map((character) => (
          <ManageCharacterCard
            key={character.id}
            character={character}
            onDelete={handleDelete}
            onEdit={handleSaveCharacter}
          />
        ))}
      </div>

      {!editingCharacter && (
        <EditInstructionsModalAdmin
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSave={handleSaveCharacter}
          mode="create"
        />
      )}
    </div>
  )
} 