import { useMemo, useState } from 'react'
import { AGE_RANGE_LABELS } from '../../types'
import { useArcade } from '../../hooks/useArcade'
import { GameUploader } from './GameUploader'
import { GameEditor } from './GameEditor'
import fondoMadera from '../../assets/img/fondoMadera.png'
import buttonBack from '../../assets/img/buttonBack.png'

type AdminTab = 'scores' | 'upload' | 'edit'

export function AdminDashboard() {
  const { isAdminPanelOpen, setAdminPanelOpen, getHighScores } = useArcade()
  const [activeTab, setActiveTab] = useState<AdminTab>('scores')
  
  const scores = useMemo(() => getHighScores(50), [getHighScores, isAdminPanelOpen])

  if (!isAdminPanelOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8"
      role="dialog"
      aria-label="Panel de administración"
    >
      <div
        style={{ backgroundImage: `url(${fondoMadera})` }}
        className="relative flex max-h-full w-full max-w-4xl flex-col overflow-y-auto border-8 border-[#3b2314] bg-repeat p-2 shadow-[12px_12px_0_0_#000] pixel-canvas"
      >
        <div className="flex h-full flex-col gap-4 border-4 border-[#8f563b] bg-black/60 p-6 font-pixel text-[8px] leading-loose text-arcade-cyan backdrop-blur-sm">
          
          <header className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#8f563b] pb-4">
            <div>
              <p className="text-[6px] text-arcade-gold drop-shadow-md">Panel de Control</p>
              <h2 className="text-[14px] uppercase tracking-wide text-white drop-shadow-[2px_2px_0_#000]">
                ADMINISTRACIÓN
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setAdminPanelOpen(false)}
              className="cursor-pointer border-none bg-transparent p-0 transition-transform hover:scale-105"
            >
              <img
                src={buttonBack}
                alt="VOLVER"
                className="h-auto w-24 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                draggable={false}
              />
            </button>
          </header>

          <nav className="flex gap-4 border-b-2 border-[#8f563b] pb-2">
            <button
              onClick={() => setActiveTab('scores')}
              className={`px-4 py-2 uppercase transition-colors ${
                activeTab === 'scores'
                  ? 'bg-arcade-gold text-black'
                  : 'bg-black text-arcade-gold hover:bg-[#8f563b] hover:text-white'
              }`}
            >
              High Scores
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 uppercase transition-colors ${
                activeTab === 'upload'
                  ? 'bg-arcade-gold text-black'
                  : 'bg-black text-arcade-gold hover:bg-[#8f563b] hover:text-white'
              }`}
            >
              Cargar Juego
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 uppercase transition-colors ${
                activeTab === 'edit'
                  ? 'bg-arcade-gold text-black'
                  : 'bg-black text-arcade-gold hover:bg-[#8f563b] hover:text-white'
              }`}
            >
              Editar Juego
            </button>
          </nav>

          <div className="flex-1 overflow-auto p-2">
            {activeTab === 'scores' && (
              <div className="text-[8px]">
                <p className="mb-4 text-arcade-gold">
                  Top juegos jugados... {scores.length} juego(s) con votos.
                </p>
                {scores.length === 0 ? (
                  <p className="animate-pulse opacity-70">No hay datos de votación todavía.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b-2 border-[#8f563b] text-white">
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
                            className="border-b border-[#8f563b]/50 hover:bg-white/10"
                          >
                            <td className="p-2 text-arcade-gold">{index + 1}</td>
                            <td className="p-2 font-mono text-[8px] opacity-70">{row.gameId}</td>
                            <td className="p-2 font-bold text-white">{row.title}</td>
                            <td className="p-2">{AGE_RANGE_LABELS[row.ageRange]}</td>
                            <td className="p-2 text-center text-arcade-cyan">{row.totalVotes}</td>
                            <td className="p-2 text-arcade-gold">
                              {'★'.repeat(Math.round(row.averageStars))}
                              <span className="ml-1 text-[6px] text-white/70">
                                ({row.averageStars})
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'upload' && (
              <GameUploader onSuccess={() => setActiveTab('scores')} />
            )}

            {activeTab === 'edit' && (
              <GameEditor onSuccess={() => setActiveTab('scores')} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
