import { useArcade } from './hooks/useArcade'
import { AdminDashboard } from './components/AdminPanel/AdminDashboard'
import { FeedbackOverlay } from './components/FeedbackOverlay/FeedbackOverlay'
import { GameModal } from './components/GameModal/GameModal'
import { HomeView } from './views/HomeView/HomeView'
import { RegisterView } from './views/RegisterView/RegisterView'
import { MapView } from './views/MapView/MapView'

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
  const { activeGame } = useArcade()

  return (
    <div className="min-h-svh w-full">
      <ScreenRouter />
      {activeGame && <GameModal game={activeGame} />}
      <FeedbackOverlay />
      <AdminDashboard />
    </div>
  )
}
