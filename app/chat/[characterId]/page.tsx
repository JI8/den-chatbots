'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { supabase } from '@/lib/supabase'
import type { Character } from '@/types/character'

export default function ChatPage() {
  const params = useParams()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCharacter() {
      const { data, error } = await supabase
        .from('characters')
        .select(`
          *,
          instruction_blocks (*)
        `)
        .eq('id', params.characterId)
        .single()
      
      if (error) {
        console.error('Error fetching character:', error)
        return
      }

      setCharacter({
        id: data.id,
        name: data.name,
        role: data.role,
        image: data.image,
        description: data.description,
        topics: data.topics,
        instructionPrompt: data.instruction_blocks.map((block: any) => ({
          id: block.id,
          content: block.content,
          isActive: block.is_active
        }))
      })
      setLoading(false)
    }

    fetchCharacter()
  }, [params.characterId])

  if (loading || !character) {
    return <div>Loading...</div>
  }

  return (
    <MainLayout>
      <ChatInterface character={character} />
    </MainLayout>
  )
} 