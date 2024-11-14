'use client'
import React from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE3ED] to-[#E5F4E0]">
      <header className="bg-[#37001F] shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src="/placeholder.svg" alt="Logo" className="h-10 w-10 mr-4" />
            <h1 className="text-2xl font-bold text-[#FFFFFF]">DEN Chatbots</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 