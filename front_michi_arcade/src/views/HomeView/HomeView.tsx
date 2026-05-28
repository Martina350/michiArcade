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
        aria-label="Logo Michi Money"
      >
        <div className="relative">
          <div className="font-pixel text-4xl text-arcade-gold drop-shadow-[4px_4px_0_#000] md:text-5xl">
            🐱
          </div>
          <h1 className="mt-4 font-pixel text-[12px] leading-relaxed text-arcade-cyan md:text-[14px]">
            MICHI MONEY
            <br />
            <span className="text-arcade-gold">ARCADE</span>
          </h1>
        </div>
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
