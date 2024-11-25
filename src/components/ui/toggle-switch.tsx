'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ToggleSwitchProps {
  isActive: boolean
  onToggle: () => void
  disabled?: boolean
  className?: string
}

export function ToggleSwitch({ 
  isActive, 
  onToggle, 
  disabled = false,
  className 
}: ToggleSwitchProps) {
  return (
    <div
      onClick={() => !disabled && onToggle()}
      className={cn(
        "relative w-14 h-7 rounded-full transition-colors duration-200 cursor-pointer",
        isActive ? 'bg-[#37001F]' : 'bg-gray-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <motion.div
        initial={false}
        animate={{
          left: isActive ? "calc(100% - 1.75rem)" : "2px",
          backgroundColor: isActive ? '#F05627' : '#ffffff',
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 40
        }}
        className="absolute top-0.5 w-6 h-6 rounded-full transform-gpu"
      />
    </div>
  )
} 