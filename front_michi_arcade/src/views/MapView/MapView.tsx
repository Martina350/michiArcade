import { AGE_RANGE_LABELS } from '../../types'
import { useArcade } from '../../hooks/useArcade'
import { useAdminTrigger } from '../../hooks/useAdminTrigger'
import { PixelButton } from '../../components/UI/PixelButton'
import { MapCanvas } from './MapCanvas'

export function MapView() {
  const {
    session,
    gamesForSession,
    isGameUnlocked,
    completedGameIds,
    openGame,
    logout,
    setAdminPanelOpen,
  } = useArcade()

  const { registerLogoClick } = useAdminTrigger({
    onActivate: () => setAdminPanelOpen(true),
  })

  if (!session) return null

  return (
    <main className="flex min-h-svh flex-col px-4 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b-4 border-arcade-gold pb-4">
        <button
          type="button"
          onClick={registerLogoClick}
          className="cursor-pointer border-none bg-transparent text-left"
        >
          <p className="font-pixel text-[8px] text-arcade-gold">MICHI MONEY ARCADE</p>
          <h1 className="font-pixel text-[10px] text-arcade-cyan">
            Hola, {session.nickname}!
          </h1>
        </button>

        <div className="text-right">
          <p className="font-pixel text-[8px] text-arcade-gold">
            {AGE_RANGE_LABELS[session.ageRange]}
          </p>
          <p className="font-pixel text-[6px] text-arcade-cyan/70">
            {completedGameIds.size}/{gamesForSession.length} completados
          </p>
        </div>

        <PixelButton variant="ghost" onClick={logout} className="!text-[8px]">
          SALIR
        </PixelButton>
      </header>

      <section className="mx-auto w-full max-w-4xl flex-1">
        <div className="mb-3 flex flex-wrap justify-between gap-2 font-pixel text-[8px] text-arcade-cyan">
          <p>▶ Selecciona un nivel desbloqueado en el mapa</p>
          <p className="text-arcade-gold text-[7px]">
            🕹️ Moverse: Flechas [↑][↓][←][→] y [ENTER] | O haz Clic
          </p>
        </div>

        <MapCanvas
          games={gamesForSession}
          isUnlocked={isGameUnlocked}
          isCompleted={(id) => completedGameIds.has(id)}
          onNodeClick={openGame}
        />
      </section>

      <footer className="mt-6 text-center font-pixel text-[6px] text-arcade-cyan/50">
        Completa niveles en orden para desbloquear los siguientes y expandir tu legado
      </footer>
    </main>
  )
}
