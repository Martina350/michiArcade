import { useMemo } from 'react'
import { AGE_RANGE_LABELS } from '../../types'
import { useArcade } from '../../hooks/useArcade'
import { PixelButton } from '../UI/PixelButton'

export function AdminDashboard() {
  const { isAdminPanelOpen, setAdminPanelOpen, getHighScores } = useArcade()

  const scores = useMemo(() => getHighScores(50), [getHighScores])

  if (!isAdminPanelOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-label="Panel de administración"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col border-4 border-green-500 bg-black font-mono text-green-400 shadow-[0_0_20px_rgba(0,255,0,0.3)]">
        <header className="flex items-center justify-between border-b border-green-700 px-4 py-3">
          <div>
            <p className="text-xs text-green-600">MICHI ARCADE // SYS_ADMIN</p>
            <h2 className="text-lg font-bold tracking-widest">
              &gt; HIGH_SCORES.DB
            </h2>
          </div>
          <PixelButton
            variant="ghost"
            onClick={() => setAdminPanelOpen(false)}
            className="!border-green-600 !text-green-400 !text-[8px]"
          >
            [ESC] CERRAR
          </PixelButton>
        </header>

        <div className="overflow-auto p-4 text-sm">
          <p className="mb-4 text-green-600">
            Leyendo localStorage... {scores.length} juego(s) con votos.
          </p>

          {scores.length === 0 ? (
            <p className="animate-pulse">&gt; Sin datos de votación aún._</p>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-green-800 text-green-300">
                  <th className="p-2">#</th>
                  <th className="p-2">ID</th>
                  <th className="p-2">TÍTULO</th>
                  <th className="p-2">RANGO</th>
                  <th className="p-2">VOTOS</th>
                  <th className="p-2">PROMEDIO</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((row, index) => (
                  <tr
                    key={row.gameId}
                    className="border-b border-green-900/50 hover:bg-green-950"
                  >
                    <td className="p-2 text-arcade-gold">{index + 1}</td>
                    <td className="p-2 font-mono text-[10px]">{row.gameId}</td>
                    <td className="p-2">{row.title}</td>
                    <td className="p-2">{AGE_RANGE_LABELS[row.ageRange]}</td>
                    <td className="p-2">{row.totalVotes}</td>
                    <td className="p-2">
                      {'★'.repeat(Math.round(row.averageStars))}
                      <span className="ml-1 text-green-600">
                        ({row.averageStars})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <footer className="border-t border-green-800 px-4 py-2 text-[10px] text-green-700">
          Konami activado | Datos: michi_arcade_feedback
        </footer>
      </div>
    </div>
  )
}
