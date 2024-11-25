'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock } from 'lucide-react'

interface PasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PasswordModal({ open, onOpenChange, onSuccess }: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    
    if (password === correctPassword) {
      setError(false)
      setPassword('')
      onSuccess()
      onOpenChange(false)
    } else {
      setError(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#37001F]" />
            <span>Enter Admin Password</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            onKeyPress={handleKeyPress}
            className={`${error ? 'border-red-500' : ''}`}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500">
              Incorrect password. Please try again.
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            className="bg-[#37001F] hover:bg-[#F05627]"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 