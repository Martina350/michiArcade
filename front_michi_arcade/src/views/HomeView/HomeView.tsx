import logoMichiArcade from '../../assets/img/logoMichiArcade.png'
import buttonStart from '../../assets/img/buttonStart.png'
import { useArcade } from '../../hooks/useArcade'
import { useAdminTrigger } from '../../hooks/useAdminTrigger'

export function HomeView() {
  const { goToScreen, setAdminAuthOpen } = useArcade()

  const { registerLogoClick } = useAdminTrigger({
    onActivate: () => setAdminAuthOpen(true),
  })

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-10 px-4 py-12">
      <div
        onClick={registerLogoClick}
        className="group border-none bg-transparent p-0"
        aria-label="Logo Michi Arcade"
      >
        <img
          src={logoMichiArcade}
          alt="Michi Arcade"
          width={480}
          height={200}
          className="pixel-canvas logo-glow-hover h-auto w-full max-w-[min(480px,90vw)]"
          draggable={false}
        />
      </div>
      <button
        type="button"
        onClick={() => goToScreen('register')}
        className="cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 hover:scale-110 active:scale-95"
      >
        <img
          src={buttonStart}
          alt="START"
          className="pixel-canvas h-auto w-full max-w-[220px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_20px_35px_rgba(255,215,0,0.4)]"
          draggable={false}
        />
      </button>
    </main>
  )
}
