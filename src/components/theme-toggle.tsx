'use client'

import { useTheme } from '@/components/theme-provider'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative inline-flex h-8 w-14 cursor-pointer items-center rounded-full bg-muted transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`absolute left-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {theme === 'dark' ? (
          <Moon className="h-3.5 w-3.5" />
        ) : (
          <Sun className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  )
}
