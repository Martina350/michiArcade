import logoMichiArcade from '../../assets/img/logoMichiArcade.png'
import { useArcade } from '../../hooks/useArcade'
import { useAdminTrigger } from '../../hooks/useAdminTrigger'
import { PixelButton } from '../../components/UI/PixelButton'

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
          className="pixel-canvas h-auto w-full max-w-[min(480px,90vw)] drop-shadow-[6px_6px_0_#000] transition-transform group-hover:scale-[1.02]"
          draggable={false}
        />
      </button>

      <div className="animate-pulse font-pixel text-[10px] text-arcade-gold">
        ▶ PRESS START
      </div>

      <PixelButton
        variant="gold"
        onClick={() => goToScreen('register')}
        className="min-w-[200px]"
      >
        START
      </PixelButton>

      <p className="max-w-xs font-pixel text-[6px] leading-loose text-arcade-cyan/60">
        Plataforma educativa arcade · Junior · Master · Legend
      </p>
    </main>
  )
}
