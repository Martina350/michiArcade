import { useEffect } from 'react'
import { isGameCompletedMessage } from '../types'

interface UseWindowMessengerOptions {
  enabled: boolean
  onGameCompleted: () => void
  /** Orígenes permitidos; vacío = acepta cualquier origen (solo dev/demo) */
  allowedOrigins?: string[]
}

export function useWindowMessenger({
  enabled,
  onGameCompleted,
  allowedOrigins = [],
}: UseWindowMessengerOptions): void {
  useEffect(() => {
    if (!enabled) return

    const handleMessage = (event: MessageEvent) => {
      if (allowedOrigins.length > 0 && !allowedOrigins.includes(event.origin)) {
        return
      }

      let payload: unknown = event.data
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch {
          return
        }
      }

      if (isGameCompletedMessage(payload)) {
        onGameCompleted()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [enabled, onGameCompleted, allowedOrigins])
}
