import { useState } from 'react'
import { useArcade } from '../../hooks/useArcade'
import { AGE_RANGE_LABELS } from '../../types'

export function GameDeleter({ onSuccess }: { onSuccess: () => void }) {
  const { allGames, deleteGame } = useArcade()
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (gameId: string, gameTitle: string) => {
    const confirmed = window.confirm(
      `¿Eliminar "${gameTitle}"? Esta acción no se puede deshacer y también borrará todas sus calificaciones.`
    )
    if (!confirmed) return

    setDeletingId(gameId)
    setLoading(true)
    try {
      await deleteGame(gameId)
      onSuccess()
    } catch (err) {
      console.error(err)
      alert('Hubo un error al eliminar el juego.')
    } finally {
      setLoading(false)
      setDeletingId(null)
    }
  }

  if (allGames.length === 0) {
    return (
      <p className="animate-pulse text-arcade-gold opacity-70">
        No hay juegos registrados todavía.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3 font-pixel text-[8px] text-arcade-cyan">
      <p className="text-arcade-gold">
        Selecciona un juego para eliminarlo permanentemente.
      </p>

      <div className="flex flex-col gap-2">
        {allGames.map((game) => {
          const isDeleting = deletingId === game.id && loading
          return (
            <div
              key={game.id}
              className="flex items-center justify-between gap-4 border-2 border-[#8f563b] bg-black/40 p-3"
            >
              {/* Miniatura */}
              <div className="flex-shrink-0 h-10 w-20 overflow-hidden rounded-sm border border-[#8f563b]">
                {game.thumbnailUrl ? (
                  <img
                    src={game.thumbnailUrl}
                    alt={game.title}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <span className="text-[6px] text-white/40">SIN IMG</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <span className="truncate text-white font-bold">{game.title}</span>
                <span className="text-arcade-gold text-[6px]">
                  {AGE_RANGE_LABELS[game.ageRange]}
                </span>
              </div>

              {/* Botón eliminar */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDelete(game.id, game.title)}
                className={`flex-shrink-0 border-2 px-3 py-2 font-pixel text-[8px] transition-colors
                  ${isDeleting
                    ? 'animate-pulse border-gray-600 text-gray-500'
                    : 'border-red-600 text-red-500 hover:bg-red-600 hover:text-black'
                  }
                  disabled:cursor-not-allowed disabled:border-gray-600 disabled:text-gray-600`}
              >
                {isDeleting ? 'ELIMINANDO...' : '✕ ELIMINAR'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
