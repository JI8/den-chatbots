'use client'
import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { CharacterSelector } from '@/components/character/CharacterSelector'
import { PasswordModal } from '@/components/auth/PasswordModal'
import { supabase } from '@/lib/supabase'
import type { Character } from '@/types/character'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  useEffect(() => {
    async function fetchCharacters() {
      const { data, error } = await supabase
        .from('characters')
        .select(`
          *,
          instruction_blocks (*)
        `)
      
      if (error) {
        console.error('Error fetching characters:', error)
        return
      }

      const transformedCharacters = data.map(char => ({
        id: char.id,
        name: char.name,
        role: char.role,
        image: char.image,
        description: char.description,
        topics: char.topics,
        instructionPrompt: char.instruction_blocks.map((block: any) => ({
          id: block.id,
          content: block.content,
          isActive: block.is_active,
          isLocked: block.is_locked
        }))
      }))

      setCharacters(transformedCharacters)
      setLoading(false)
    }

    fetchCharacters()
  }, [])

  const handleStartChat = (character: Character) => {
    router.push(`/chat/${character.id}`)
  }

  const handleViewPrompt = (character: Character) => {
    console.log('View prompt for', character)
  }

  const handlePasswordSuccess = () => {
    router.push('/manage/characters')
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="h-[calc(100vh-88px)] flex items-center justify-center">
          <div className="space-y-2 text-center">
            <p className="text-lg text-[#37001F]">Loading characters...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch the characters</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (characters.length === 0) {
    return (
      <MainLayout>
        <div className="h-[calc(100vh-88px)] flex items-center justify-center">
          <div className="space-y-4 text-center">
            <p className="text-lg text-[#37001F]">No characters found</p>
            <p className="text-sm text-gray-500">Please add some characters in the admin panel</p>
            <Button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="bg-[#37001F] hover:bg-[#F05627]"
            >
              <Settings className="h-4 w-4 mr-2" />
              Go to Admin Panel
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto relative">
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute right-4 top-4 z-20"
          onClick={() => setIsPasswordModalOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <CharacterSelector 
          characters={characters}
          onStartChat={handleStartChat}
          onViewPrompt={handleViewPrompt}
        />
        <PasswordModal
          open={isPasswordModalOpen}
          onOpenChange={setIsPasswordModalOpen}
          onSuccess={handlePasswordSuccess}
        />
      </div>
    </MainLayout>
  )
} 