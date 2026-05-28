import { useCallback, useEffect, useRef } from 'react'

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
] as const

interface UseAdminTriggerOptions {
  onActivate: () => void
  logoClickTarget?: number
  logoClickWindowMs?: number
}

export function useAdminTrigger({
  onActivate,
  logoClickTarget = 5,
  logoClickWindowMs = 2000,
}: UseAdminTriggerOptions): {
  registerLogoClick: () => void
} {
  const konamiIndex = useRef(0)
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activate = useCallback(() => {
    onActivate()
  }, [onActivate])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const expected = KONAMI_SEQUENCE[konamiIndex.current]
      if (event.code === expected) {
        konamiIndex.current += 1
        if (konamiIndex.current === KONAMI_SEQUENCE.length) {
          konamiIndex.current = 0
          activate()
        }
      } else {
        konamiIndex.current =
          event.code === KONAMI_SEQUENCE[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activate])

  const registerLogoClick = useCallback(() => {
    if (clickTimer.current) clearTimeout(clickTimer.current)

    clickCount.current += 1
    if (clickCount.current >= logoClickTarget) {
      clickCount.current = 0
      activate()
      return
    }

    clickTimer.current = setTimeout(() => {
      clickCount.current = 0
    }, logoClickWindowMs)
  }, [activate, logoClickTarget, logoClickWindowMs])

  useEffect(() => {
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current)
    }
  }, [])

  return { registerLogoClick }
}
