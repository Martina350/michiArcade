import { useContext } from 'react'
import { ArcadeContext } from '../context/ArcadeContext'
import type { ArcadeContextValue } from '../types'

export function useArcade(): ArcadeContextValue {
  const ctx = useContext(ArcadeContext)
  if (!ctx) {
    throw new Error('useArcade debe usarse dentro de <ArcadeProvider>')
  }
  return ctx
}
