export const ARCADE_COLORS = {
  electricBlue: '#0D47A1',
  gold: '#FFD54F',
  cyan: '#E0F7FF',
} as const

export const STORAGE_KEYS = {
  session: 'michi_arcade_session',
  feedback: 'michi_arcade_feedback',
  completedGames: 'michi_arcade_completed_games',
  customGames: 'michi_arcade_custom_games',
} as const

export type AgeRange = 'kids' | 'junior' | 'teens'

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  kids: 'Kids (4-9)',
  junior: 'Junior (10-14)',
  teens: 'Teens (15-19)',
}

export type ArcadeScreen = 'home' | 'register' | 'map'

export interface StudentSession {
  nickname: string
  age: number
  ageRange: AgeRange
  createdAt: string
}

export interface MapNodePosition {
  x: number
  y: number
}

export type MapBiome = 'meadow' | 'canyon' | 'sky'

export interface Game {
  id: string
  title: string
  description?: string
  ageRange: AgeRange
  embedUrl: string
  biome: MapBiome
  mapPosition: MapNodePosition
  unlockOrder: number
  thumbnailUrl?: string
}

export interface GameFeedback {
  gameId: string
  stars: 1 | 2 | 3 | 4 | 5
  nickname: string
  timestamp: number
}

export interface GameStats {
  gameId: string
  title: string
  ageRange: AgeRange
  totalVotes: number
  averageStars: number
}

export const GAME_COMPLETED_MESSAGE = 'game_completed' as const

export interface GameCompletedPayload {
  status: typeof GAME_COMPLETED_MESSAGE
}

export function isGameCompletedMessage(
  data: unknown,
): data is GameCompletedPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    (data as GameCompletedPayload).status === GAME_COMPLETED_MESSAGE
  )
}

export interface ArcadeContextValue {
  screen: ArcadeScreen
  goToScreen: (screen: ArcadeScreen) => void
  session: StudentSession | null
  registerStudent: (nickname: string, age: number) => Promise<StudentSession>
  logout: () => void
  allGames: readonly Game[]
  gamesForSession: Game[]
  isGameUnlocked: (gameId: string) => boolean
  markGameCompleted: (gameId: string) => void
  completedGameIds: ReadonlySet<string>
  activeGame: Game | null
  openGame: (game: Game) => void
  closeGame: () => void
  pendingFeedbackGameId: string | null
  setPendingFeedbackGameId: (gameId: string | null) => void
  submitFeedback: (gameId: string, stars: 1 | 2 | 3 | 4 | 5) => void
  feedbackByGameId: Record<string, GameFeedback[]>
  getHighScores: (limit?: number) => GameStats[]
  isAdminPanelOpen: boolean
  setAdminPanelOpen: (open: boolean) => void
  isAdminAuthOpen: boolean
  setAdminAuthOpen: (open: boolean) => void
  customGames: Game[]
  addCustomGame: (game: Omit<Game, 'id'>) => Promise<void>
  updateGame: (gameId: string, gameData: Partial<Game>) => Promise<void>
}
