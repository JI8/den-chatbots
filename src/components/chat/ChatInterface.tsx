'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, Settings, ArrowUp, RefreshCw, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Character, InstructionBlock } from '@/types/character'
import { EditInstructionsModal } from '@/components/character/EditInstructionsModal'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import ReactMarkdown from 'react-markdown'
import { getFinetuningPreferences } from '@/lib/localStorage'
import { TypingAnimation } from '@/components/ui/typing-animation'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface ChatInterfaceProps {
  character: Character
}

const MAX_MESSAGES = 50 // Maximum number of messages to keep in history
const CONTINUATION_MARKER = '... [continued]'

export function ChatInterface({ character }: ChatInterfaceProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isFineTuneOpen, setIsFineTuneOpen] = useState(false)
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false)
  const [showStarters, setShowStarters] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentInstructions, setCurrentInstructions] = useState<InstructionBlock[]>(() => 
    getFinetuningPreferences(character.id, character.instructionPrompt || [])
  )
  const [previousInstructions, setPreviousInstructions] = useState<InstructionBlock[]>()
  const [isConfirmNavigateOpen, setIsConfirmNavigateOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const [pendingContent, setPendingContent] = useState('');

  // Add message history management
  useEffect(() => {
    if (messages.length > MAX_MESSAGES) {
      setMessages(prev => {
        const trimmedMessages = prev.slice(-MAX_MESSAGES)
        // Always keep the welcome message if it exists
        const welcomeMessage = prev.find(m => m.id === 'welcome')
        return welcomeMessage 
          ? [welcomeMessage, ...trimmedMessages.filter(m => m.id !== 'welcome')]
          : trimmedMessages
      })
    }
  }, [messages.length])

  // Handle instruction updates from fine-tuning modal
  const handleInstructionUpdate = (updatedCharacter: Character) => {
    setPreviousInstructions(currentInstructions)
    setCurrentInstructions(getFinetuningPreferences(character.id, updatedCharacter.instructionPrompt || []))
  }

  const resetChat = useCallback(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: character.welcomeMessage || `Hello! I'm ${character.name}, ${character.role}. ${character.description} How can I help you today?`,
      role: 'assistant',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    setInput('')
    setShowStarters(true)
    setIsConfirmResetOpen(false)
  }, [character])

  // Simulated typing effect
  const simulateTyping = (text: string) => {
    let currentIndex = 0
    const textToType = text.toString()
    setInput('')
    textareaRef.current?.focus()
    
    const type = () => {
      if (currentIndex < textToType.length) {
        setInput(textToType.slice(0, currentIndex + 1))
        currentIndex++
        typingTimeoutRef.current = setTimeout(type, 15) // Faster typing speed
        
        // Keep focus and move caret to end
        const textarea = textareaRef.current
        if (textarea) {
          textarea.focus()
          const len = textarea.value.length
          textarea.setSelectionRange(len, len)
        }
      }
    }

    clearTimeout(typingTimeoutRef.current)
    type()
  }

  // Cleanup typing animation on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleStarterClick = (starter: string) => {
    simulateTyping(starter)
  }

  // Initialize welcome message only once
  useEffect(() => {
    if (messages.length === 0) {
      setIsInitializing(true)
      setTimeout(() => {
        resetChat()
        setIsInitializing(false)
      }, 500)
    }
  }, [resetChat, character.name, character.role, character.description, character.welcomeMessage, messages.length])

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: 'user',
      timestamp: new Date()
    }

    // Don't add continuation requests to the visible messages
    if (!messageContent.includes('Please continue your previous response')) {
      setMessages(prev => [...prev, newUserMessage])
    }
    setInput('')
    setIsTyping(true)
    setShowStarters(false)
    setError(null)

    try {
      // Convert messages to OpenAI format, but limit the history
      const messageHistory = messages
        .slice(-10) // Only send last 10 messages for context
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          messages: messageHistory,
          character,
          instructions: currentInstructions,
          previousInstructions,
        }),
        signal: AbortSignal.timeout(120000) // 2 minute timeout
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      setIsSearching(response.headers.get('X-Is-Searching') === '1')

      // Create a new message for the assistant's response
      const assistantMessageId = Date.now().toString()
      const newAssistantMessage: Message = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date()
      }

      // Only add new message if not continuing previous
      if (!messageContent.includes('Please continue your previous response')) {
        setMessages(prev => [...prev, newAssistantMessage])
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      let accumulatedContent = ''
      let lastMessageId = assistantMessageId
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        accumulatedContent += text

        // Batch content updates
        setPendingContent(prev => prev + text)
        
        // Update messages with throttling
        if (contentUpdateTimeoutRef.current) {
          clearTimeout(contentUpdateTimeoutRef.current)
        }
        
        contentUpdateTimeoutRef.current = setTimeout(() => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1]
            if (messageContent.includes('Please continue your previous response')) {
              // If this is a continuation, append to the last message
              return prev.map(msg =>
                msg.id === lastMessage.id
                  ? { ...msg, content: msg.content + pendingContent }
                  : msg
              )
            } else {
              // Otherwise update the new message
              return prev.map(msg =>
                msg.id === assistantMessageId
                  ? { ...msg, content: accumulatedContent }
                  : msg
              )
            }
          })
          setPendingContent('')
          smoothScrollToBottom()
        }, 50) // Update UI at most 20 times per second
      }

      // Check if response was truncated and needs continuation
      if (accumulatedContent.trim().endsWith(CONTINUATION_MARKER)) {
        // Remove the continuation marker
        setMessages(prev => prev.map(msg =>
          msg.id === lastMessageId
            ? { ...msg, content: msg.content.replace(CONTINUATION_MARKER, '...') }
            : msg
        ))

        // Wait a short moment before requesting continuation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Send a follow-up request to continue the response
        await sendMessage('Please continue your previous response')
      }
      
      setPreviousInstructions(undefined)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      setError(errorMessage)
      console.error('Error in chat:', errorMessage)
    } finally {
      setIsTyping(false)
      setIsSearching(false)
    }
  }

  const handleSend = async () => {
    await sendMessage(input)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const smoothScrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100) // Throttle to max 10 scrolls per second
  }, [])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      if (contentUpdateTimeoutRef.current) clearTimeout(contentUpdateTimeoutRef.current)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    smoothScrollToBottom()
  }, [messages.length])

  const handleNavigateBack = () => {
    if (messages.length <= 1) {
      // If only welcome message exists, navigate directly
      router.push('/')
    } else {
      // If there are messages, show confirmation
      setIsConfirmNavigateOpen(true)
    }
  }

  const handleConfirmedNavigate = () => {
    router.push('/')
  }

  return (
    <div className="flex flex-col h-full max-h-[100dvh]">
      {/* Loading overlay */}
      <div className={`absolute inset-0 bg-white z-50 flex items-center justify-center transition-opacity duration-500 ${isInitializing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#37001F]/20 border-t-[#37001F] rounded-full animate-spin" />
          <div className="text-[#37001F] text-lg">Chat starten...</div>
        </div>
      </div>

      {/* Fixed header section */}
      <div className="w-full bg-white border-b flex-none">
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center justify-between max-w-5xl w-full">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNavigateBack}
                className="text-[#37001F]"
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
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsConfirmResetOpen(true)}
                className="text-[#37001F] hover:bg-[#FFE3ED]"
                title="Start nieuwe chat"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFineTuneOpen(true)}
                className="text-[#37001F] hover:bg-[#FFE3ED]"
                title="Mijn instructies"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-grow overflow-y-auto bg-[#FFE3ED] overscroll-none">
        <div className="flex flex-col min-h-full">
          {/* Messages container */}
          <div className="flex-grow overflow-y-auto p-4 pb-[100px] overscroll-none">
            <div className="max-w-5xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-6 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-[#F05627] text-white rounded-br-none'
                        : 'bg-white text-[#37001F] rounded-bl-none'
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-sm max-w-none break-words"
                      components={{
                        p: ({ children }) => <p className="mb-6 last:mb-0 whitespace-pre-line leading-relaxed">{children}</p>,
                        a: ({ children, href }) => (
                          <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`${message.role === 'user' 
                              ? 'text-white hover:text-white/80' 
                              : 'text-[#F05627] hover:text-[#37001F]'} 
                              hover:underline transition-colors`}
                          >
                            {children}
                          </a>
                        ),
                        ul: ({ children }) => <ul className="my-4 ml-4 list-disc space-y-2">{children}</ul>,
                        ol: ({ children }) => <ol className="my-4 ml-4 list-decimal space-y-2">{children}</ol>,
                        li: ({ children }) => <li className="my-1">{children}</li>,
                        h1: ({ children }) => <h1 className="text-xl font-bold my-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold my-3">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-bold my-2">{children}</h3>,
                        blockquote: ({ children }) => (
                          <blockquote className={`border-l-4 ${
                            message.role === 'user' 
                              ? 'border-white/50 text-white/90' 
                              : 'border-[#F05627]/50 text-[#37001F]/90'
                            } pl-4 my-4 italic`}>
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className={`${
                            message.role === 'user'
                              ? 'bg-white/10 text-white'
                              : 'bg-gray-100/50 text-[#37001F]'
                            } px-1.5 py-0.5 rounded text-sm`}>
                            {children}
                          </code>
                        ),
                        table: ({ children }) => (
                          <div className="my-8 overflow-x-auto rounded-lg relative">
                            <table 
                              className="w-full border-collapse bg-[#FAFAFA]"
                              role="table"
                              aria-label="Data table"
                            >
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-[#2A2A2A] sticky top-0">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="divide-y divide-[#37001F]/5">
                            {children}
                          </tbody>
                        ),
                        tr: ({ children }) => (
                          <tr className="even:bg-white/30">
                            {children}
                          </tr>
                        ),
                        th: ({ children }) => (
                          <th 
                            className="px-4 py-3 text-left text-sm font-medium text-white/90 tracking-wide"
                            scope="col"
                          >
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-4 py-3 text-sm leading-relaxed">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 bg-white text-[#37001F]">
                    <div className="flex items-center gap-3">
                      {isSearching && (
                        <BookOpen className="h-5 w-5 text-[#F05627] animate-pulse" />
                      )}
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Conversation starters */}
          {showStarters && messages.length <= 1 && (
            <div className="p-4 mb-20">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  {character.conversationStarters?.map((starter, index) => (
                    <button
                      key={index}
                      onClick={() => handleStarterClick(starter)}
                      className="group px-6 py-4 border-2 border-[#37001F]/20 text-[#37001F] text-sm 
                        rounded-lg hover:bg-[#FFE3ED] hover:border-[#37001F] transition-all duration-200
                        text-center break-words min-h-[64px] flex items-center justify-center
                        shadow-sm hover:shadow-md relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-[#FFE3ED]/0 group-hover:bg-[#FFE3ED]/50 transition-all duration-200" />
                      <span className="relative">{starter}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat input - Fixed at bottom */}
      <div className="bg-[#37001F] flex-none fixed bottom-0 left-0 right-0 w-full z-10">
        <div className="max-w-5xl mx-auto flex items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-adjust height
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Jouw bericht..."
            className="flex-grow bg-transparent border-0 text-white/80 placeholder:text-white/40 text-lg
              focus:ring-0 focus:border-0 focus:outline-none rounded-none px-6 py-6 resize-none
              focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[80px] max-h-[200px] overflow-y-auto"
            disabled={isTyping}
            rows={1}
            style={{ height: '80px' }}
          />
          <div className="px-4 py-4 flex-none flex items-center">
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

      <ConfirmationModal
        open={isConfirmNavigateOpen}
        onOpenChange={setIsConfirmNavigateOpen}
        title="Terug naar overzicht"
        description="Weet je zeker dat je terug wilt gaan? De huidige chat zal worden verwijderd."
        confirmText="Terug naar overzicht"
        cancelText="Annuleren"
        onConfirm={handleConfirmedNavigate}
      />

      <EditInstructionsModal
        character={character}
        open={isFineTuneOpen}
        onOpenChange={setIsFineTuneOpen}
        onUpdate={handleInstructionUpdate}
      />
      
      <ConfirmationModal
        open={isConfirmResetOpen}
        onOpenChange={setIsConfirmResetOpen}
        title="Start nieuwe chat"
        description="Weet je zeker dat je een nieuwe chat wilt starten? De huidige chat zal worden verwijderd."
        confirmText="Start nieuwe chat"
        cancelText="Annuleren"
        onConfirm={resetChat}
      />
    </div>
  )
} 