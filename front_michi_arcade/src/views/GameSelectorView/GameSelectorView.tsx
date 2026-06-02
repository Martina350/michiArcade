import { AGE_RANGE_LABELS } from '../../types'
import type { Game } from '../../types'
import { useArcade } from '../../hooks/useArcade'
import { useAdminTrigger } from '../../hooks/useAdminTrigger'
import buttonExit from '../../assets/img/buttonExit.png'
import logoMichiArcade from '../../assets/img/logoMichiArcade.png'

function GameCard({
  game,
  isUnlocked,
  isCompleted,
  stars,
  onClick,
}: {
  game: Game
  isUnlocked: boolean
  isCompleted: boolean
  stars: number | null
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className={`group relative h-40 w-full overflow-hidden rounded-full border-4 shadow-xl transition-all duration-300 ${isUnlocked
        ? 'cursor-pointer border-arcade-cyan hover:scale-105 hover:border-arcade-gold hover:shadow-[0_0_20px_rgba(45,212,191,0.6)]'
        : 'cursor-not-allowed border-gray-600 opacity-80 grayscale'
        }`}
    >
      {/* Background Gradient matching biome */}
      <div
        className={`absolute inset-0 ${game.biome === 'meadow'
          ? 'bg-gradient-to-br from-green-400 to-emerald-800'
          : game.biome === 'canyon'
            ? 'bg-gradient-to-br from-orange-400 to-red-800'
            : 'bg-gradient-to-br from-blue-400 to-indigo-800'
          }`}
      />

      {/* Fake Thumbnail image to simulate games */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
        style={{ backgroundImage: `url(https://picsum.photos/seed/${game.id}/400/200)` }}
      />

      {/* Glassy overlay for the pill look */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-white/10" />

      {/* Glossy reflection on top half (similar to reference image) */}
      <div className="absolute left-0 right-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-between p-4 px-8">
        <h3 className="font-pixel text-[12px] text-white drop-shadow-[2px_2px_0_#000] sm:text-[14px]">
          {game.title}
        </h3>

        <div className="flex w-full items-end justify-between">
          <div className="flex h-8 min-w-10 items-center justify-center rounded-full bg-black/60 px-3 shadow-inner backdrop-blur-sm">
            {isCompleted ? (
              <span className="font-pixel text-[8px] text-arcade-gold">✔ COMPLETADO {stars ? `(${stars}★)` : ''}</span>
            ) : isUnlocked ? (
              <span className="font-pixel text-[8px] text-white">▶ JUGAR</span>
            ) : (
              <span className="font-pixel text-[8px] text-gray-400">🔒 BLOQUEADO</span>
            )}
          </div>
          {isUnlocked && !isCompleted && (
            <div className="font-pixel text-[6px] text-arcade-cyan drop-shadow-[1px_1px_0_#000] group-hover:animate-pulse">
              [CLICK]
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export function MapView() {
  const {
    session,
    gamesForSession,
    isGameUnlocked,
    completedGameIds,
    openGame,
    logout,
    setAdminPanelOpen,
    feedbackByGameId,
  } = useArcade()

  const { registerLogoClick } = useAdminTrigger({
    onActivate: () => setAdminPanelOpen(true),
  })

  if (!session) return null

  return (
    <main className="flex min-h-svh flex-col px-4 py-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border-4 border-arcade-gold bg-black/60 p-4 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={registerLogoClick}
          className="flex cursor-pointer items-center gap-4 border-none bg-transparent text-left transition-transform hover:scale-105"
        >
          <img
            src={logoMichiArcade}
            alt="Michi Arcade"
            className="h-auto w-full max-w-[140px] drop-shadow-md"
            draggable={false}
          />
          <h1 className="font-pixel text-[12px] text-arcade-cyan drop-shadow-md">
            Hola, {session.nickname}!
          </h1>
        </button>

        <div className="text-right">
          <p className="font-pixel text-[8px] text-arcade-gold">
            {AGE_RANGE_LABELS[session.ageRange]}
          </p>
          <p className="font-pixel text-[6px] text-white">
            <span className="text-arcade-cyan">{completedGameIds.size}</span> / {gamesForSession.length} juegos completados
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 hover:scale-105 active:scale-95"
          aria-label="Salir"
        >
          <img
            src={buttonExit}
            alt="SALIR"
            className="pixel-canvas h-auto w-full max-w-[140px] drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] hover:drop-shadow-[0_8px_15px_rgba(255,100,100,0.4)]"
            draggable={false}
          />
        </button>
      </header>

      <section className=" mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center">
        <div className="mb-10 text-center font-pixel text-white drop-shadow-md">
          <p className="mb-2 text-[14px] text-arcade-gold">SELECCIONA UN JUEGO</p>
          <p className="text-[8px] text-arcade-cyan/80">Diviertete completando cada minijuego de educacion financiera</p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {gamesForSession.map((game) => {
            const feedbacks = feedbackByGameId[game.id] || []
            const userFb = feedbacks.find(f => f.nickname === session.nickname)
            const stars = userFb ? userFb.stars : null

            return (
              <GameCard
                key={game.id}
                game={game}
                isUnlocked={isGameUnlocked(game.id)}
                isCompleted={completedGameIds.has(game.id)}
                stars={stars}
                onClick={() => openGame(game)}
              />
            )
          })}
        </div>
      </section>

      <footer className="mt-8 text-center font-pixel text-[6px] text-white/50">
        RECUERDA QUE TU CALIFICACION ES IMPORTANTE!!
      </footer>
    </main>
  )
}
