'use client'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { Input } from "@/components/ui/input"

interface PromptBlock {
  id: string
  content: string
  isActive: boolean
}

interface PromptEditorProps {
  characterName: string
  blocks: PromptBlock[]
  onToggleBlock: (id: string) => void
  onAddBlock: (content: string) => void
  onRemoveBlock: (id: string) => void
}

export function PromptEditor({
  characterName,
  blocks,
  onToggleBlock,
  onAddBlock,
  onRemoveBlock,
}: PromptEditorProps) {
  const [newBlockContent, setNewBlockContent] = React.useState('')

  const handleAddBlock = () => {
    if (newBlockContent.trim()) {
      onAddBlock(newBlockContent)
      setNewBlockContent('')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          My Inner Workings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#37001F]">
            {characterName}&apos;s Inner Workings
          </DialogTitle>
          <DialogDescription className="text-[#F05627]">
            Toggle and customize the instruction blocks that guide my responses
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-4">
          <AnimatePresence>
            {blocks.map((block) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative"
              >
                <div className={`
                  p-4 rounded-lg border-2 transition-all duration-300
                  ${block.isActive 
                    ? 'bg-[#FFE3ED]/20 border-[#FFE3ED]' 
                    : 'bg-gray-100 border-gray-200'
                  }
                `}>
                  <div className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleBlock(block.id)}
                      className="mt-1"
                    >
                      {block.isActive ? (
                        <ToggleRight className="h-5 w-5 text-[#F05627]" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                    <p className={`flex-grow ${block.isActive ? 'text-[#37001F]' : 'text-gray-400'}`}>
                      {block.content}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveBlock(block.id)}
                      className="hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex items-center gap-2 mt-6">
            <Input
              placeholder="Add new instruction block..."
              value={newBlockContent}
              onChange={(e) => setNewBlockContent(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleAddBlock} className="bg-[#F05627] hover:bg-[#37001F]">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 