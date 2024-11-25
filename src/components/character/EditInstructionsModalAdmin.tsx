'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Lock, Unlock, Plus, ImageIcon } from 'lucide-react'
import { Character, InstructionBlock } from '@/types/character'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { resizeImage } from '@/lib/imageUtils'

interface EditInstructionsModalAdminProps {
  character?: Character
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (character: Character) => void
  mode: 'create' | 'edit'
}

export function EditInstructionsModalAdmin({ 
  character, 
  open, 
  onOpenChange,
  onSave,
  mode
}: EditInstructionsModalAdminProps) {
  const [formData, setFormData] = useState({
    name: character?.name || '',
    role: character?.role || '',
    description: character?.description || '',
    topics: character?.topics || [],
    image: character?.image || ''
  })
  const [newTopic, setNewTopic] = useState('')
  const [instructions, setInstructions] = useState<InstructionBlock[]>(
    character?.instructionPrompt || []
  )
  const [newInstruction, setNewInstruction] = useState('')
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        name: '',
        role: '',
        description: '',
        topics: [],
        image: ''
      })
      setInstructions([])
    } else if (character) {
      setFormData({
        name: character.name,
        role: character.role,
        description: character.description,
        topics: character.topics,
        image: character.image
      })
      setInstructions(character.instructionPrompt || [])
    }
  }, [character, mode, open])

  const handleAddTopic = () => {
    if (!newTopic.trim()) return
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, newTopic.trim()]
    }))
    setNewTopic('')
  }

  const handleRemoveTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }))
  }

  const handleAddInstruction = () => {
    if (!newInstruction.trim()) return

    // Split by # and filter out empty strings
    const instructions = newInstruction
      .split('#')
      .map(text => text.trim())
      .filter(text => text.length > 0)

    // Create new blocks for each instruction
    const newBlocks = instructions.map(content => ({
      id: Date.now().toString() + Math.random(),
      content,
      isActive: true,
      isLocked
    }))

    setInstructions(prev => [...prev, ...newBlocks])
    setNewInstruction('')
    setIsLocked(false)
  }

  const handleRemoveInstruction = (id: string) => {
    setInstructions(prev => prev.filter(block => block.id !== id))
  }

  const handleToggleLock = (id: string) => {
    setInstructions(prev => prev.map(block =>
      block.id === id ? { ...block, isLocked: !block.isLocked } : block
    ))
  }

  const handleSave = async () => {
    try {
      const characterData = {
        ...formData,
        instructionPrompt: instructions,
        id: character?.id // Will be undefined for new characters
      }
      onSave(characterData as Character)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving character:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Resize image
      const resizedBlob = await resizeImage(file)
      
      // Upload to Supabase Storage
      const filename = `character-${Date.now()}.jpg`
      const { data, error } = await supabase.storage
        .from('character-images')
        .upload(filename, resizedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('character-images')
        .getPublicUrl(filename)

      // Update form data with new image URL
      setFormData(prev => ({ ...prev, image: publicUrl }))
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
        <div className="px-6 py-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#37001F]">
              {mode === 'create' ? 'Create New Character' : `Edit ${character?.name}`}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#37001F] text-lg">Character Image</h3>
            <div 
              className="relative w-32 h-32 mx-auto group cursor-pointer rounded-full overflow-hidden"
              onClick={() => document.getElementById('imageUpload')?.click()}
            >
              <Avatar className="w-full h-full">
                <AvatarImage 
                  src={formData.image || character?.image} 
                  alt="Character" 
                  className="object-cover"
                />
                <AvatarFallback>
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">Change Image</p>
              </div>
              <input
                id="imageUpload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Click to upload a new image
            </p>
          </div>

          {/* Basic Info */}
          <div className="space-y-6">
            <h3 className="font-semibold text-[#37001F] text-lg">Basic Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Character Name
                  <span className="text-[#F05627] ml-1">*</span>
                </label>
                <textarea
                  placeholder="Enter character name..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full min-h-[60px] p-3 border border-gray-200 resize-y
                    focus:border-[#37001F] focus:ring-0 transition-colors rounded-md"
                  rows={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Role
                  <span className="text-[#F05627] ml-1">*</span>
                </label>
                <textarea
                  placeholder="Enter character role..."
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full min-h-[60px] p-3 border border-gray-200 resize-y
                    focus:border-[#37001F] focus:ring-0 transition-colors rounded-md"
                  rows={1}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description
                <span className="text-[#F05627] ml-1">*</span>
              </label>
              <textarea
                placeholder="Enter a detailed description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full min-h-[100px] p-3 border border-gray-200 resize-y
                  focus:border-[#37001F] focus:ring-0 transition-colors rounded-md"
                rows={3}
              />
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-semibold text-[#37001F] text-lg">Topics</h3>
                <p className="text-sm text-gray-500">Add topics this character specializes in</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <textarea
                  placeholder="Add a new topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddTopic()}
                  className="flex-grow p-3 border border-gray-200 resize-none rounded-md
                    focus:border-[#37001F] focus:ring-0 transition-colors"
                  rows={1}
                />
                <Button 
                  onClick={handleAddTopic}
                  className="bg-[#37001F] hover:bg-[#F05627]"
                >
                  Add Topic
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 min-h-[100px] rounded-md">
                {formData.topics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#37001F]"
                  >
                    <span className="text-sm">{topic}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTopic(index)}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-semibold text-[#37001F] text-lg">Instructions</h3>
                <p className="text-sm text-gray-500">Define how the character should behave</p>
              </div>
            </div>
            <div className="space-y-4">
              {instructions.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-md bg-gray-50">
                  <p className="text-gray-500">No instructions added yet</p>
                  <p className="text-sm text-gray-400">Add some instructions to define how your character should behave</p>
                </div>
              ) : (
                instructions
                  .sort((a, b) => {
                    // Sort by locked status first (locked items on top)
                    if (a.isLocked && !b.isLocked) return -1;
                    if (!a.isLocked && b.isLocked) return 1;
                    return 0;
                  })
                  .map((block) => (
                    <div
                      key={block.id}
                      className={`flex gap-4 p-4 border rounded-md ${
                        block.isLocked ? 'bg-[#FFE3ED]/30' : 'bg-white'
                      }`}
                    >
                      <textarea
                        value={block.content}
                        onChange={(e) => {
                          setInstructions(prev => prev.map(b =>
                            b.id === block.id ? { ...b, content: e.target.value } : b
                          ))
                        }}
                        className="flex-grow min-h-[80px] p-3 border border-gray-200 resize-y rounded-md
                          focus:border-[#37001F] focus:ring-0 transition-colors"
                        rows={2}
                      />
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleLock(block.id)}
                          className={block.isLocked ? 'text-[#F05627]' : ''}
                        >
                          {block.isLocked ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveInstruction(block.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
              )}

              {/* Add New Instruction */}
              <div className="flex gap-4 p-4 border-2 border-dashed rounded-md">
                <div className="flex-grow space-y-2">
                  <textarea
                    placeholder="Type instructions separated by # symbol..."
                    value={newInstruction}
                    onChange={(e) => setNewInstruction(e.target.value)}
                    className="w-full min-h-[80px] p-3 border border-gray-200 resize-y rounded-md
                      focus:border-[#37001F] focus:ring-0 transition-colors"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500">
                    Use # to separate multiple instructions. Each part will become a separate block.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLocked(!isLocked)}
                    className={isLocked ? 'text-[#F05627]' : ''}
                  >
                    {isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddInstruction}
                    className="text-[#37001F]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t bg-white px-6 py-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#37001F] hover:bg-[#F05627] px-8"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 