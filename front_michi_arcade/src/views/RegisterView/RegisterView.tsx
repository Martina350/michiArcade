import { useState, type FormEvent } from 'react'
import { AGE_RANGE_LABELS } from '../../types'
import { resolveAgeRange } from '../../context/arcadeLogic'
import { useArcade } from '../../hooks/useArcade'
import { PixelButton } from '../../components/UI/PixelButton'
import { PixelInput } from '../../components/UI/PixelInput'
import { RPGCard } from '../../components/UI/RPGCard'

export function RegisterView() {
  const { registerStudent, goToScreen } = useArcade()
  const [nickname, setNickname] = useState('')
  const [ageInput, setAgeInput] = useState('')
  const [error, setError] = useState('')

  const previewAge = parseInt(ageInput, 10)
  const previewRange =
    Number.isInteger(previewAge) && previewAge >= 6
      ? resolveAgeRange(previewAge)
      : null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      registerStudent(nickname, parseInt(ageInput, 10))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-8">
      <RPGCard title="NUEVO JUGADOR" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <PixelInput
            label="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ej: MichiPro"
            maxLength={20}
            autoFocus
            required
          />

          <PixelInput
            label="Edad"
            type="number"
            min={6}
            max={99}
            value={ageInput}
            onChange={(e) => setAgeInput(e.target.value)}
            placeholder="Ej: 10"
            required
          />

          {previewRange && (
            <p className="text-center text-arcade-gold">
              Rango: {AGE_RANGE_LABELS[previewRange]}
            </p>
          )}

          {error && (
            <p className="text-center text-red-400" role="alert">
              {error}
            </p>
          )}

          <PixelButton type="submit" variant="gold" fullWidth>
            ENTRAR AL MAPA
          </PixelButton>

          <PixelButton
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => goToScreen('home')}
          >
            ← VOLVER
          </PixelButton>
        </form>
      </RPGCard>
    </main>
  )
}
