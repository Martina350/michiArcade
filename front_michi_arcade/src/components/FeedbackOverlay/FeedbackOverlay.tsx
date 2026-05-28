import { useMemo } from 'react'
import { GAMES_CATALOG } from '../../context/ArcadeContext'
import { useArcade } from '../../hooks/useArcade'
import { RPGCard } from '../UI/RPGCard'
import { StarRating } from '../UI/StarRating'

export function FeedbackOverlay() {
  const { pendingFeedbackGameId, submitFeedback } = useArcade()

  const game = useMemo(
    () => GAMES_CATALOG.find((g) => g.id === pendingFeedbackGameId),
    [pendingFeedbackGameId],
  )

  if (!pendingFeedbackGameId || !game) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <RPGCard title="¡NIVEL COMPLETADO!" className="max-w-md w-full text-center">
        <p className="mb-6 text-center">
          ¡Buen trabajo! Califica este juego para el ranking arcade.
        </p>
        <StarRating
          gameTitle={game.title}
          onSubmit={(stars) => submitFeedback(game.id, stars)}
        />
      </RPGCard>
    </div>
  )
}
