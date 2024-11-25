'use client'
import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { CharacterManager } from '@/components/character/CharacterManager'
import { supabase } from '@/lib/supabase'
import type { Character } from '@/types/character'

export default function ManageCharacters() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

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

      // Transform the data to match our Character type
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

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="h-96 flex items-center justify-center">
            <div className="space-y-2 text-center">
              <p className="text-lg text-[#37001F]">Loading characters...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch your characters</p>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-8 py-12">
        <CharacterManager initialCharacters={characters} />
      </div>
    </MainLayout>
  )
} 