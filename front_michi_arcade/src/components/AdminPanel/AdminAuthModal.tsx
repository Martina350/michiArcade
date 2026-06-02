import { useState, type FormEvent } from 'react'
import { useArcade } from '../../hooks/useArcade'
import { PixelInput } from '../UI/PixelInput'

import buttonBack from '../../assets/img/buttonBack.png'
import buttonIngresar from '../../assets/img/ingresarButton.png'
import fondoMadera from '../../assets/img/fondoMadera.png'

export function AdminAuthModal() {
  const { isAdminAuthOpen, setAdminAuthOpen, setAdminPanelOpen } = useArcade()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isAdminAuthOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (password === 'michiadmin') {
      setAdminAuthOpen(false)
      setAdminPanelOpen(true)
      setPassword('')
      setError(null)
    } else {
      setError('Contraseña incorrecta')
      setPassword('')
    }
  }

  const handleClose = () => {
    setAdminAuthOpen(false)
    setPassword('')
    setError(null)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
      <div
        style={{ backgroundImage: `url(${fondoMadera})` }}
        className="relative w-full max-w-sm border-8 border-[#3b2314] bg-repeat p-2 shadow-[12px_12px_0_0_#000] pixel-canvas"
      >
        <div className="flex flex-col gap-6 border-4 border-[#8f563b] bg-transparent p-6 font-pixel text-[8px] leading-loose text-arcade-cyan">
          <div className="border-b-4 border-[#8f563b] pb-3 text-center">
            <h2 className="font-pixel text-[12px] uppercase tracking-wide text-arcade-gold drop-shadow-[2px_2px_0_#000]">
              ACCESO RESTRINGIDO
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            <p className="text-center font-pixel text-[8px] text-white drop-shadow-md">
              Ingresa la contraseña de administrador
            </p>

            <PixelInput
              label="Contraseña"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              placeholder="******"
              error={error || undefined}
              autoFocus
            />

            <div className="mt-4 flex flex-col items-center gap-6">
              <button
                type="submit"
                className="cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none"
              >
                <img
                  src={buttonIngresar}
                  alt="ENTRAR"
                  className="pixel-canvas h-auto w-full max-w-[220px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_20px_35px_rgba(255,215,0,0.4)]"
                  draggable={false}
                />
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none"
              >
                <img
                  src={buttonBack}
                  alt="VOLVER"
                  className="pixel-canvas h-auto w-full max-w-[220px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_20px_35px_rgba(255,215,0,0.4)]"
                  draggable={false}
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
