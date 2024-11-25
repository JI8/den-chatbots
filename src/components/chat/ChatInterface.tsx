'use client'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, ArrowUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Character } from '@/types/character'
import { generateChatResponse } from '@/lib/openai'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface ChatInterfaceProps {
  character: Character
}

export function ChatInterface({ character }: ChatInterfaceProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Add welcome message when chat starts
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Hello! I'm ${character.name}, ${character.role}. ${character.description} How can I help you today?`,
      role: 'assistant',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [character])

  // Add this useEffect to check if the API key is loaded
  useEffect(() => {
    console.log('OpenAI API Key exists:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await generateChatResponse(
        input,
        character.instructionPrompt || [],
        character.name,
        character.role
      )
      
      // 15% chance to split the message
      const shouldSplit = Math.random() < 0.15
      
      if (shouldSplit) {
        const sentences = response.split('. ')
        const midPoint = Math.floor(sentences.length / 2)
        const firstPart = sentences.slice(0, midPoint).join('. ') + '.'
        const secondPart = sentences.slice(midPoint).join('. ')

        // Send first part
        await new Promise(resolve => setTimeout(resolve, 1500))
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: firstPart,
          role: 'assistant',
          timestamp: new Date()
        }])

        // Show typing indicator again
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Send second part
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          content: secondPart,
          role: 'assistant',
          timestamp: new Date()
        }])
      } else {
        // Single response after delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Error getting response:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `${character.name} is disconnected, maybe try later?`,
        role: 'assistant',
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="bg-white border-b p-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={character.image} alt={character.name} />
              <AvatarFallback>{character.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-[#37001F]">{character.name}</h2>
              <p className="text-sm text-[#F05627]">{character.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-auto bg-[#FFE3ED] p-4 pb-32">
        <div className="max-w-5xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 ${
                  message.role === 'user'
                    ? 'bg-[#37001F] text-white'
                    : 'bg-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-4 flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#37001F] h-24">
        <div className="max-w-5xl mx-auto flex items-center h-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            className="flex-grow bg-transparent border-0 text-white/80 placeholder:text-white/40 text-lg
              focus:ring-0 focus:border-0 focus:outline-none rounded-none px-6
              focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isTyping}
          />
          <div className="px-4 flex items-center">
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-transparent hover:bg-white/10 text-white/80 rounded-full w-12 h-12 p-0 flex items-center justify-center
                focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <div className="rounded-full border-2 border-current p-2">
                <ArrowUp className="h-5 w-5" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 