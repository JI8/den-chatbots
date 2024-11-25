'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Lock, AlertCircle, Sparkles } from 'lucide-react'
import { Character, InstructionBlock } from '@/types/character'
import { supabase } from '@/lib/supabase'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Slider } from '@/components/ui/slider'

interface EditInstructionsModalProps {
  character: Character
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (character: Character) => void
  isAdminView?: boolean
}

export function EditInstructionsModal({ 
  character, 
  open, 
  onOpenChange,
  onUpdate,
  isAdminView = false
}: EditInstructionsModalProps) {
  const [instructions, setInstructions] = useState<InstructionBlock[]>(
    character.instructionPrompt || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Separate locked (core) prompts from unlocked ones
  const corePrompts = instructions.filter(block => block.isLocked)
  const additionalPrompts = instructions.filter(block => !block.isLocked)

  const handleToggle = async (blockId: string) => {
    setIsSubmitting(true)
    const updatedInstructions = instructions.map(block =>
      block.id === blockId ? { ...block, isActive: !block.isActive } : block
    )
    setInstructions(updatedInstructions)

    try {
      const { error } = await supabase
        .from('instruction_blocks')
        .update({ is_active: !instructions.find(b => b.id === blockId)?.isActive })
        .eq('id', blockId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating instruction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onUpdate({
      ...character,
      instructionPrompt: instructions
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border-0">
        <DialogHeader className="flex flex-row items-center gap-4 pb-6 border-b">
          <Avatar className="h-16 w-16">
            <AvatarImage src={character.image} alt={character.name} />
            <AvatarFallback>{character.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle className="text-[#37001F] text-xl">
              Finetune {character.name}
            </DialogTitle>
            <p className="text-sm text-[#F05627] mt-1">
              {character.role}
            </p>
          </div>
        </DialogHeader>
        
        <div className="flex-grow overflow-auto py-6 space-y-10 pr-6">
          {/* Core Instructions Section */}
          {corePrompts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#37001F] font-semibold">
                <Lock className="h-4 w-4" />
                <h3>Core Instructions</h3>
              </div>
              <div className="space-y-3 px-4">
                {corePrompts.map((block) => (
                  <div 
                    key={block.id} 
                    className="flex items-start space-x-2 bg-[#FFE3ED]/30 p-4 border border-[#FFE3ED]"
                  >
                    <p className="flex-grow text-sm text-gray-700">{block.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Instructions Section */}
          {additionalPrompts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#37001F] font-semibold">
                <AlertCircle className="h-4 w-4" />
                <h3>Additional Instructions</h3>
              </div>
              <div className="space-y-3 px-4">
                {additionalPrompts.map((block) => (
                  <div 
                    key={block.id} 
                    className={`flex items-start space-x-4 p-4 border transition-colors duration-200 ${
                      block.isActive 
                        ? 'bg-white border-gray-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0 pt-1">
                      <ToggleSwitch
                        isActive={block.isActive}
                        onToggle={() => handleToggle(block.id)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex-grow">
                      <p className={`text-sm ${block.isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                        {block.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {instructions.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed rounded-md bg-gray-50">
              <p className="text-gray-500">No instructions available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 