import React, { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Send, Info, ToggleLeft, ToggleRight, X, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"

interface Character {
  name: string
  role: string
  image: string
  description: string
  topics: string[]
  instructionPrompt: InstructionBlock[]
}

interface InstructionBlock {
  id: string
  content: string
  isActive: boolean
}

interface Message {
  text: string
  sender: 'user' | 'ai'
}

const initialCharacters: Character[] = [
  {
    name: 'Sam',
    role: 'Inclusie Adviseur',
    image: '/placeholder.svg?height=200&width=200',
    description: 'Perfect om te raadplegen als je inclusiviteit en diversiteit wilt bevorderen binnen je culturele projecten.',
    topics: ['Inclusiviteit', 'Diversiteit', 'Culturele projecten'],
    instructionPrompt: [
      { id: '1', content: "You are Sam, an Inclusion Advisor.", isActive: true },
      { id: '2', content: "Your goal is to help users promote inclusivity and diversity in their cultural projects.", isActive: true },
      { id: '3', content: "Provide advice and strategies based on best practices in the field of diversity and inclusion.", isActive: true },
      { id: '4', content: "Be empathetic, patient, and always strive to educate users on the importance of representation and accessibility in cultural spaces.", isActive: true },
    ]
  },
  {
    name: 'Mira',
    role: 'Innovative Curator',
    image: '/placeholder.svg?height=200&width=200',
    description: 'Specializes in curating cutting-edge exhibitions that challenge conventional art perspectives.',
    topics: ['Contemporary Art', 'Exhibition Design', 'Art Technology'],
    instructionPrompt: [
      { id: '1', content: "You are Mira, an Innovative Curator.", isActive: true },
      { id: '2', content: "Your expertise lies in creating groundbreaking exhibitions that push the boundaries of traditional art.", isActive: true },
      { id: '3', content: "Offer insights on emerging artists, unconventional exhibition spaces, and the integration of technology in art.", isActive: true },
      { id: '4', content: "Be bold, creative, and always encourage users to think outside the box when it comes to artistic expression and curation.", isActive: true },
    ]
  },
  {
    name: 'Leo',
    role: 'Cultural Heritage Specialist',
    image: '/placeholder.svg?height=200&width=200',
    description: 'Expert in preserving and promoting cultural heritage through digital means and community engagement.',
    topics: ['Digital Preservation', 'Community Outreach', 'Heritage Education'],
    instructionPrompt: [
      { id: '1', content: "You are Leo, a Cultural Heritage Specialist.", isActive: true },
      { id: '2', content: "Your mission is to help preserve and promote cultural heritage using innovative digital technologies.", isActive: true },
      { id: '3', content: "Provide strategies for community engagement and education about local and global cultural heritage.", isActive: true },
      { id: '4', content: "Be passionate about history, technology, and the importance of preserving cultural identity for future generations.", isActive: true },
    ]
  }
]

export default function Component() {
  const [characters, setCharacters] = useState(initialCharacters)
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [newBlockContent, setNewBlockContent] = useState('')

  const currentCharacter = characters[currentCharacterIndex]

  const cycleCharacter = (direction: number) => {
    setCurrentCharacterIndex((prevIndex) => {
      const newIndex = (prevIndex + direction + characters.length) % characters.length
      return newIndex
    })
  }

  const startChat = () => {
    setShowChat(true)
  }

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, sender: 'user' }])
      setInputValue('')
      setTimeout(() => {
        setMessages(prev => [...prev, { text: "This is a placeholder AI response.", sender: 'ai' }])
      }, 1000)
    }
  }

  const newChat = () => {
    setMessages([])
    setShowChat(false)
  }

  const toggleInstructionBlock = (id: string) => {
    setCharacters(prevCharacters => {
      const newCharacters = [...prevCharacters]
      const character = newCharacters[currentCharacterIndex]
      character.instructionPrompt = character.instructionPrompt.map(block =>
        block.id === id ? { ...block, isActive: !block.isActive } : block
      )
      return newCharacters
    })
  }

  const addInstructionBlock = () => {
    if (newBlockContent.trim()) {
      setCharacters(prevCharacters => {
        const newCharacters = [...prevCharacters]
        const character = newCharacters[currentCharacterIndex]
        character.instructionPrompt.push({
          id: Date.now().toString(),
          content: newBlockContent,
          isActive: true
        })
        return newCharacters
      })
      setNewBlockContent('')
    }
  }

  const removeInstructionBlock = (id: string) => {
    setCharacters(prevCharacters => {
      const newCharacters = [...prevCharacters]
      const character = newCharacters[currentCharacterIndex]
      character.instructionPrompt = character.instructionPrompt.filter(block => block.id !== id)
      return newCharacters
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#FFE3ED] to-[#E5F4E0]">
      <header className="bg-[#37001F] shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src="/placeholder.svg?height=40&width=40" alt="Logo" className="h-10 w-10 mr-4" />
            <h1 className="text-2xl font-bold text-[#FFFFFF]">AI Character Chat</h1>
          </div>
        </div>
      </header>
      <main className="flex-grow overflow-hidden">
        <div className="h-full max-w-7xl mx-auto p-4 flex items-center justify-center">
          <Card className="w-full h-[calc(100%-2rem)] mb-8 bg-white/90 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden flex flex-col">
            {!showChat ? (
              <div className="flex-grow flex items-center justify-center p-6">
                <Button variant="ghost" size="icon" onClick={() => cycleCharacter(-1)} className="mr-4">
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <div className="relative w-[400px] h-[550px]">
                  <AnimatePresence initial={false} custom={currentCharacterIndex}>
                    <motion.div
                      key={currentCharacterIndex}
                      custom={currentCharacterIndex}
                      variants={{
                        enter: (direction) => ({ opacity: 0, x: direction > 0 ? 100 : -100 }),
                        center: { opacity: 1, x: 0 },
                        exit: (direction) => ({ opacity: 0, x: direction > 0 ? -100 : 100 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="absolute inset-0"
                    >
                      <Card className="w-full h-full flex flex-col shadow-lg">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex flex-col items-center mb-4">
                            <Avatar className="h-24 w-24 mb-4">
                              <AvatarImage src={currentCharacter.image} alt={currentCharacter.name} />
                              <AvatarFallback>{currentCharacter.name[0]}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-2xl font-bold text-[#37001F] text-center">{currentCharacter.name}</h3>
                            <p className="text-sm text-[#F05627] text-center">{currentCharacter.role}</p>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 text-center">{currentCharacter.description}</p>
                          <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {currentCharacter.topics.map((topic, index) => (
                              <span key={index} className="bg-[#FFE3ED] text-[#37001F] px-2 py-1 rounded-full text-xs">
                                {topic}
                              </span>
                            ))}
                          </div>
                          <div className="flex-grow" />
                          <div className="flex flex-col gap-2 mt-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                  <Info className="w-4 h-4 mr-2" />
                                  My Inner Workings
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{currentCharacter.name}'s Inner Workings</DialogTitle>
                                  <DialogDescription>
                                    Edit and manage the instruction blocks that guide {currentCharacter.name}'s responses and behavior.
                                  </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="mt-4 h-[400px] pr-4">
                                  {currentCharacter.instructionPrompt.map((block) => (
                                    <div key={block.id} className="flex items-start mb-4 bg-gray-100 p-3 rounded-md">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mr-2 mt-1"
                                        onClick={() => toggleInstructionBlock(block.id)}
                                      >
                                        {block.isActive ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                                      </Button>
                                      <p className={`flex-grow text-sm ${block.isActive ? 'text-gray-700' : 'text-gray-400'}`}>{block.content}</p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeInstructionBlock(block.id)}
                                      >
                                        <X className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  ))}
                                </ScrollArea>
                                <div className="mt-4 flex items-center gap-2">
                                  <Input
                                    placeholder="Add new instruction block..."
                                    value={newBlockContent}
                                    onChange={(e) => setNewBlockContent(e.target.value)}
                                    className="flex-grow"
                                  />
                                  <Button onClick={addInstructionBlock}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              className="w-full bg-[#F05627] hover:bg-[#37001F] text-white" 
                              onClick={startChat}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Chat with {currentCharacter.name}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <Button variant="ghost" size="icon" onClick={() => cycleCharacter(1)} className="ml-4">
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-4 bg-[#E5F4E0]">
                  <Button variant="ghost" size="icon" onClick={newChat} className="rounded-full">
                    <ArrowLeft className="h-6 w-6 text-purple-800" />
                    <span className="sr-only">Back to character selection</span>
                  </Button>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentCharacter.image} alt={currentCharacter.name} />
                      <AvatarFallback>{currentCharacter.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-lg font-semibold text-purple-800">{currentCharacter.name} - {currentCharacter.role}</span>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full">
                          <Info className="w-4 h-4 mr-2" />
                          My Inner Workings
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{currentCharacter.name}'s Inner Workings</DialogTitle>
                          <DialogDescription>
                            Edit and manage the instruction blocks that guide {currentCharacter.name}'s responses and behavior.
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="mt-4 h-[400px] pr-4">
                          {currentCharacter.instructionPrompt.map((block) => (
                            <div key={block.id} className="flex items-start mb-4 bg-gray-100 p-3 rounded-md">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mr-2 mt-1"
                                onClick={() => toggleInstructionBlock(block.id)
                                }
                              >
                                {block.isActive ? (
                                  <ToggleRight className="h-5 w-5 text-green-500" />
                                ) : (
                                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                                )}
                              </Button>
                              <p
                                className={`flex-grow text-sm ${
                                  block.isActive ? 'text-gray-700' : 'text-gray-400'
                                }`}
                              >
                                {block.content}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeInstructionBlock(block.id)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </ScrollArea>
                        <div className="mt-4 flex items-center gap-2">
                          <Input
                            placeholder="Add new instruction block..."
                            value={newBlockContent}
                            onChange={(e) => setNewBlockContent(e.target.value)}
                            className="flex-grow"
                          />
                          <Button onClick={addInstructionBlock}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="rounded-full" onClick={newChat}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Chat
                    </Button>
                  </div>
                </header>
                <ScrollArea className="flex-grow p-4 bg-white">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-4 ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-2xl max-w-[80%] ${
                          message.sender === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                <footer className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Input
                      className="flex-1 rounded-full border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button onClick={handleSend} className="rounded-full bg-[#F05627] hover:bg-[#37001F]">
                      <Send className="h-5 w-5" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </footer>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}