import { useState, type FormEvent } from 'react'
import { AGE_RANGE_LABELS } from '../../types'
import {
  getAgeError,
  getNicknameError,
  resolveAgeRange,
} from '../../context/arcadeLogic'
import { useArcade } from '../../hooks/useArcade'
import { PixelButton } from '../../components/UI/PixelButton'
import { PixelInput } from '../../components/UI/PixelInput'
import { RPGCard } from '../../components/UI/RPGCard'

type FieldName = 'nickname' | 'age'

interface FieldErrors {
  nickname: string | null
  age: string | null
}

interface TouchedFields {
  nickname: boolean
  age: boolean
}

const emptyErrors = (): FieldErrors => ({ nickname: null, age: null })
const emptyTouched = (): TouchedFields => ({ nickname: false, age: false })

export function RegisterView() {
  const { registerStudent, goToScreen } = useArcade()
  const [nickname, setNickname] = useState('')
  const [ageInput, setAgeInput] = useState('')
  const [errors, setErrors] = useState<FieldErrors>(emptyErrors)
  const [touched, setTouched] = useState<TouchedFields>(emptyTouched)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const previewAge = parseInt(ageInput, 10)
  const previewRange =
    !getAgeError(ageInput) && Number.isInteger(previewAge)
      ? resolveAgeRange(previewAge)
      : null

  const validateField = (field: FieldName, value: string): string | null => {
    return field === 'nickname' ? getNicknameError(value) : getAgeError(value)
  }

  const validateAll = (): FieldErrors => ({
    nickname: validateField('nickname', nickname),
    age: validateField('age', ageInput),
  })

  const showError = (field: FieldName): string | undefined => {
    const message = errors[field]
    if (!message) return undefined
    if (submitAttempted || touched[field]) return message
    return undefined
  }

  const handleBlur = (field: FieldName) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, field === 'nickname' ? nickname : ageInput),
    }))
  }

  const handleNicknameChange = (value: string) => {
    setNickname(value)
    if (submitAttempted || touched.nickname) {
      setErrors((prev) => ({
        ...prev,
        nickname: validateField('nickname', value),
      }))
    }
  }

  const handleAgeChange = (value: string) => {
    setAgeInput(value)
    if (submitAttempted || touched.age) {
      setErrors((prev) => ({
        ...prev,
        age: validateField('age', value),
      }))
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setTouched({ nickname: true, age: true })

    const nextErrors = validateAll()
    setErrors(nextErrors)

    if (nextErrors.nickname || nextErrors.age) return

    registerStudent(nickname, parseInt(ageInput, 10))
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-8">
      <RPGCard title="NUEVO JUGADOR" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          <PixelInput
            label="Nickname"
            name="nickname"
            value={nickname}
            onChange={(e) => handleNicknameChange(e.target.value)}
            onBlur={() => handleBlur('nickname')}
            placeholder="Ej: MichiPro"
            maxLength={20}
            autoFocus
            autoComplete="nickname"
            error={showError('nickname')}
          />

          <PixelInput
            label="Edad"
            name="age"
            type="text"
            inputMode="numeric"
            value={ageInput}
            onChange={(e) => handleAgeChange(e.target.value)}
            onBlur={() => handleBlur('age')}
            placeholder="Ej: 10"
            autoComplete="off"
            error={showError('age')}
          />

          {previewRange && !showError('age') && (
            <p className="text-center text-arcade-gold">
              Rango: {AGE_RANGE_LABELS[previewRange]}
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
