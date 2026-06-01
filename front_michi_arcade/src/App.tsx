import { useArcade } from './hooks/useArcade'
import { AdminDashboard } from './components/AdminPanel/AdminDashboard'
import { FeedbackOverlay } from './components/FeedbackOverlay/FeedbackOverlay'
import { GameModal } from './components/GameModal/GameModal'
import { HomeView } from './views/HomeView/HomeView'
import { RegisterView } from './views/RegisterView/RegisterView'
import { MapView } from './views/MapView/MapView'
import fondoMichi from './assets/img/fondoMichi.png'

function ScreenRouter() {
  const { screen } = useArcade()

  switch (screen) {
    case 'home':
      return <HomeView />
    case 'register':
      return <RegisterView />
    case 'map':
      return <MapView />
    default:
      return <HomeView />
  }
}

export default function App() {
  const { activeGame, screen } = useArcade()

  // El fondo se desenfoca y oscurece si no estamos en la pantalla de inicio (home)
  const isBlurred = screen !== 'home'

  return (
    <div className="relative min-h-svh w-full overflow-x-hidden">
      {/* Contenedor del fondo de pantalla de Michi */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: `url(${fondoMichi})`,
          filter: isBlurred ? 'blur(8px) brightness(0.35)' : 'none',
          transform: isBlurred ? 'scale(1.08)' : 'scale(1)', // Evita los bordes blancos del blur
        }}
      />

      <div className="relative z-10">
        <ScreenRouter />
      </div>

      {activeGame && <GameModal game={activeGame} />}
      <FeedbackOverlay />
      <AdminDashboard />
    </div>
  )
}
