import { useCallback } from 'react'
import type { Game } from '../../types'
import { useArcade } from '../../hooks/useArcade'
import { useWindowMessenger } from '../../hooks/useWindowMessenger'

import buttonExit from '../../assets/img/buttonExit.png'
import buttonEnd from '../../assets/img/buttonEnd.png'

interface GameModalProps {
  game: Game
}

export function GameModal({ game }: GameModalProps) {
  const {
    closeGame,
    markGameCompleted,
    setPendingFeedbackGameId,
  } = useArcade()

  const handleGameCompleted = useCallback(() => {
    markGameCompleted(game.id)
    closeGame()
    setPendingFeedbackGameId(game.id)
  }, [closeGame, game.id, markGameCompleted, setPendingFeedbackGameId])

  useWindowMessenger({
    enabled: true,
    onGameCompleted: handleGameCompleted,
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Jugando ${game.title}`}
    >
      <div className="flex h-[90vh] w-full max-w-5xl flex-col border-4 border-arcade-gold bg-arcade-blue shadow-[12px_12px_0_0_#000]">
        <header className="flex items-center justify-between border-b-4 border-black bg-arcade-dark px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-block h-3 w-3 animate-pulse bg-red-500" />
            <h2 className="font-pixel text-[10px] text-arcade-gold">
              {game.title}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleGameCompleted}
              className="cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none"
            >
              <img
                src={buttonEnd}
                alt="FINALIZAR JUEGO"
                className="h-auto w-full max-w-[120px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_20px_35px_rgba(138,43,226,0.4)]"
                draggable={false}
              />
            </button>
            <button
              type="button"
              onClick={closeGame}
              className="cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none"
            >
              <img
                src={buttonExit}
                alt="SALIR"
                className="h-auto w-full max-w-[120px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_20px_35px_rgba(255,215,0,0.4)]"
                draggable={false}
              />
            </button>
          </div>
        </header>

        <div className="relative flex-1 bg-black">
          <iframe
            title={game.title}
            src={game.embedUrl}
            className="h-full w-full border-0"
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  )
}
