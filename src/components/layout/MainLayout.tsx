'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFE3ED]">
      <header className="bg-[#37001F] shadow-md p-4">
        <div className="container mx-auto flex justify-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/DEN-logo.svg"
              alt="DEN Logo"
              width={80}
              height={80}
            />
          </Link>
        </div>
      </header>
      <main className="flex-grow overflow-hidden">
        {children}
      </main>
    </div>
  )
} 