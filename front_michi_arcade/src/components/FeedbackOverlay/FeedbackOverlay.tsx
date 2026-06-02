import { useMemo } from 'react'
import { GAMES_CATALOG } from '../../context/ArcadeContext'
import { useArcade } from '../../hooks/useArcade'
import { StarRating } from '../UI/StarRating'
import fondoMadera from '../../assets/img/fondoMadera.png'

export function FeedbackOverlay() {
  const { pendingFeedbackGameId, submitFeedback } = useArcade()

  const game = useMemo(
    () => GAMES_CATALOG.find((g) => g.id === pendingFeedbackGameId),
    [pendingFeedbackGameId],
  )

  if (!pendingFeedbackGameId || !game) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div
        style={{ backgroundImage: `url(${fondoMadera})` }}
        className="relative w-full max-w-md border-8 border-[#3b2314] bg-repeat p-2 shadow-[12px_12px_0_0_#000] pixel-canvas"
      >
        <div className="flex flex-col gap-6 border-4 border-[#8f563b] bg-transparent p-6 font-pixel text-[8px] leading-loose text-arcade-cyan">
          <div className="border-b-4 border-[#8f563b] pb-3 text-center">
            <h2 className="font-pixel text-[12px] uppercase tracking-wide text-arcade-gold drop-shadow-[2px_2px_0_#000]">
              ¡NIVEL COMPLETADO!
            </h2>
          </div>
          
          <p className="text-center font-pixel text-[10px] text-white drop-shadow-[1px_1px_0_#000]">
            ¡Buen trabajo! Califica este juego para el ranking arcade.
          </p>
          <div className="flex justify-center">
            <StarRating
              gameTitle={game.title}
              onSubmit={(stars) => submitFeedback(game.id, stars)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
