import logoMichiArcade from '../../assets/img/logoMichiArcade.png'
import buttonStart from '../../assets/img/buttonStart.png'
import { useArcade } from '../../hooks/useArcade'
import { useAdminTrigger } from '../../hooks/useAdminTrigger'

export function HomeView() {
  const { goToScreen, setAdminPanelOpen } = useArcade()

  const { registerLogoClick } = useAdminTrigger({
    onActivate: () => setAdminPanelOpen(true),
  })

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-10 px-4 py-12">
      <button
        type="button"
        onClick={registerLogoClick}
        className="group cursor-pointer border-none bg-transparent p-0"
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
      </button>
      <button
        type="button"
        onClick={() => goToScreen('register')}
        className="cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 hover:scale-110 active:scale-95"
      >
        <img
          src={buttonStart}
          alt="START"
          className="pixel-canvas h-auto w-full max-w-[220px]"
          draggable={false}
        />
      </button>

      <p className="max-w-xs font-pixel text-[6px] leading-loose text-arcade-cyan/60">
        Plataforma educativa arcade · Junior · Master · Legend
      </p>
    </main>
  )
}
