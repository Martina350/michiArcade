import { useState, type FormEvent } from 'react'
import { AGE_RANGE_LABELS } from '../../types'
import {
  getAgeError,
  getNicknameError,
  resolveAgeRange,
} from '../../context/arcadeLogic'
import { useArcade } from '../../hooks/useArcade'
import { PixelInput } from '../../components/UI/PixelInput'

import buttonBack from '../../assets/img/buttonBack.png'
import buttonIngresar from '../../assets/img/ingresarButton.png'
import fondoMadera from '../../assets/img/fondoMadera.png'

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
      <div
        style={{ backgroundImage: `url(${fondoMadera})` }}
        className="relative w-full max-w-md border-8 border-[#3b2314] bg-repeat p-2 shadow-[12px_12px_0_0_#000] pixel-canvas"
      >
        <div className="flex flex-col gap-6 border-4 border-[#8f563b] bg-transparent p-6 font-pixel text-[8px] leading-loose text-arcade-cyan">
          <div className="border-b-4 border-[#8f563b] pb-3 text-center">
            <h2 className="font-pixel text-[12px] uppercase tracking-wide text-arcade-gold drop-shadow-[2px_2px_0_#000]">
              NUEVO JUGADOR
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            <PixelInput
              label="Michiname"
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
              <p className="text-center text-arcade-gold drop-shadow-[1px_1px_0_#000]">
                Rango: {AGE_RANGE_LABELS[previewRange]}
              </p>
            )}

            <div className="mt-2 flex flex-col items-center gap-4">
              <button
                type="submit"
                className="cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none"
              >
                <img
                  src={buttonIngresar}
                  alt="INGRESAR"
                  className="pixel-canvas h-auto w-full max-w-[220px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_20px_35px_rgba(255,215,0,0.4)"
                  draggable={false}
                />
              </button>

              <button
                type="button"
                onClick={() => goToScreen('home')}
                className="cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none"
              >
                <img
                  src={buttonBack}
                  alt="VOLVER"
                  className="pixel-canvas h-auto w-full max-w-[220px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_20px_35px_rgba(255,215,0,0.4)"
                  draggable={false}
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
