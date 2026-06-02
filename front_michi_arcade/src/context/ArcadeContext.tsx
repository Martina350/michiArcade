import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  ArcadeContextValue,
  ArcadeScreen,
  Game,
  GameFeedback,
  StudentSession,
  MapBiome,
  AgeRange,
} from '../types'
import { STORAGE_KEYS } from '../types'
import {
  aggregateGameStats,
  computeUnlockedGameIds,
  createSession,
  filterGamesByAgeRange,
  validateRegistration,
} from './arcadeLogic'

export const GAMES_CATALOG: readonly Game[] = [
  {
    id: 'coin-dash-junior',
    title: 'Coin Dash',
    description: 'Corre y recoge monedas Michi',
    ageRange: 'kids',
    embedUrl: '/demo-game.html',
    biome: 'meadow',
    mapPosition: { x: 100, y: 300 },
    unlockOrder: 0,
  },
  {
    id: 'piggy-jump-junior',
    title: 'Piggy Jump',
    description: 'Salta entre plataformas doradas',
    ageRange: 'kids',
    embedUrl: '/demo-game.html',
    biome: 'meadow',
    mapPosition: { x: 280, y: 220 },
    unlockOrder: 1,
  },
  {
    id: 'savings-run-junior',
    title: 'Savings Run',
    description: 'Ahorra antes de que acabe el tiempo',
    ageRange: 'kids',
    embedUrl: '/demo-game.html',
    biome: 'meadow',
    mapPosition: { x: 460, y: 280 },
    unlockOrder: 2,
  },
  {
    id: 'budget-quest-master',
    title: 'Budget Quest',
    description: 'Arma tu presupuesto semanal',
    ageRange: 'junior',
    embedUrl: '/demo-game.html',
    biome: 'canyon',
    mapPosition: { x: 120, y: 310 },
    unlockOrder: 0,
  },
  {
    id: 'trade-tycoon-master',
    title: 'Trade Tycoon',
    description: 'Compra y vende en el mercado',
    ageRange: 'junior',
    embedUrl: '/demo-game.html',
    biome: 'canyon',
    mapPosition: { x: 300, y: 230 },
    unlockOrder: 1,
  },
  {
    id: 'vault-defender-master',
    title: 'Vault Defender',
    description: 'Protege la bóveda del colegio',
    ageRange: 'junior',
    embedUrl: '/demo-game.html',
    biome: 'canyon',
    mapPosition: { x: 480, y: 290 },
    unlockOrder: 2,
  },
  {
    id: 'market-legends-legend',
    title: 'Market Legends',
    description: 'Domina la bolsa Michi',
    ageRange: 'teens',
    embedUrl: '/demo-game.html',
    biome: 'sky',
    mapPosition: { x: 110, y: 280 },
    unlockOrder: 0,
  },
  {
    id: 'crypto-cat-legend',
    title: 'Crypto Cat',
    description: 'Estrategia financiera avanzada',
    ageRange: 'teens',
    embedUrl: '/demo-game.html',
    biome: 'sky',
    mapPosition: { x: 290, y: 210 },
    unlockOrder: 1,
  },
  {
    id: 'empire-builder-legend',
    title: 'Empire Builder',
    description: 'Construye tu imperio arcade',
    ageRange: 'teens',
    embedUrl: '/demo-game.html',
    biome: 'sky',
    mapPosition: { x: 470, y: 270 },
    unlockOrder: 2,
  },
] as const

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function loadSession(): StudentSession | null {
  return readJson<StudentSession | null>(STORAGE_KEYS.session, null)
}

function loadFeedback(): GameFeedback[] {
  return readJson<GameFeedback[]>(STORAGE_KEYS.feedback, [])
}

function loadCompletedIds(): string[] {
  return readJson<string[]>(STORAGE_KEYS.completedGames, [])
}

function loadCustomGames(): Game[] {
  return readJson<Game[]>(STORAGE_KEYS.customGames, [])
}

const mapBackendGameToFrontend = (bg: any): Game => ({
  id: bg.id,
  title: bg.title,
  description: bg.description || '',
  ageRange: bg.ageRange as AgeRange,
  embedUrl: bg.embedUrl,
  biome: bg.biome as MapBiome,
  mapPosition: { x: bg.mapPositionX, y: bg.mapPositionY },
  unlockOrder: bg.unlockOrder,
  thumbnailUrl: bg.thumbnailUrl || undefined,
})

export const ArcadeContext = createContext<ArcadeContextValue | null>(null)

interface ArcadeProviderProps {
  children: ReactNode
}

export function ArcadeProvider({ children }: ArcadeProviderProps) {
  const [screen, setScreen] = useState<ArcadeScreen>(() =>
    loadSession() ? 'map' : 'home',
  )
  const [session, setSession] = useState<StudentSession | null>(loadSession)
  const [feedbackList, setFeedbackList] =
    useState<GameFeedback[]>(loadFeedback)
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(loadCompletedIds()),
  )
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [pendingFeedbackGameId, setPendingFeedbackGameId] = useState<
    string | null
  >(null)
  const [isAdminPanelOpen, setAdminPanelOpen] = useState(false)
  const [isAdminAuthOpen, setAdminAuthOpen] = useState(false)
  const [customGames, setCustomGames] = useState<Game[]>(loadCustomGames)
  const [games, setGames] = useState<Game[]>([])

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/games')
      if (res.ok) {
        const data = await res.json()
        
        const mappedGames = data.map(mapBackendGameToFrontend)
        setGames(mappedGames)

        const allFeedback: GameFeedback[] = []
        data.forEach((bg: any) => {
          if (bg.ratings) {
            bg.ratings.forEach((r: any) => {
              allFeedback.push({
                gameId: bg.id,
                stars: r.stars as 1 | 2 | 3 | 4 | 5,
                nickname: r.user?.username || 'MichiPlayer',
                timestamp: new Date(r.createdAt).getTime(),
              })
            })
          }
        })
        setFeedbackList(allFeedback)
        writeJson(STORAGE_KEYS.feedback, allFeedback)
      } else {
        setGames([...GAMES_CATALOG, ...customGames])
      }
    } catch (err) {
      console.error('Error fetching games from backend:', err)
      setGames([...GAMES_CATALOG, ...customGames])
    }
  }, [customGames])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  const allGames = useMemo(() => {
    return games
  }, [games])

  const goToScreen = useCallback((next: ArcadeScreen) => {
    setScreen(next)
  }, [])

  const gamesForSession = useMemo(() => {
    if (!session) return []
    return filterGamesByAgeRange(allGames, session.ageRange)
  }, [session, allGames])

  const unlockedIds = useMemo(
    () => computeUnlockedGameIds(gamesForSession, completedIds),
    [gamesForSession, completedIds],
  )

  const isGameUnlocked = useCallback(
    (gameId: string) => unlockedIds.has(gameId),
    [unlockedIds],
  )

  const registerStudent = useCallback(async (nickname: string, age: number) => {
    const validation = validateRegistration(nickname, age)
    if ('error' in validation) {
      throw new Error(validation.error)
    }

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: nickname, age }),
      })

      if (!res.ok) {
        throw new Error('Error al ingresar en el servidor')
      }

      const userData = await res.json()
      const newSession: StudentSession = {
        nickname: userData.username,
        age: userData.age,
        ageRange: age >= 15 ? 'teens' : age >= 10 ? 'junior' : 'kids',
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem('michi_arcade_user_id', userData.id)

      setSession(newSession)
      writeJson(STORAGE_KEYS.session, newSession)
      setScreen('map')
      return newSession
    } catch (err) {
      console.error('Error contacting backend for login, falling back to local session:', err)
      const newSession = createSession(nickname, age)
      setSession(newSession)
      writeJson(STORAGE_KEYS.session, newSession)
      setScreen('map')
      return newSession
    }
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    setActiveGame(null)
    setPendingFeedbackGameId(null)
    localStorage.removeItem(STORAGE_KEYS.session)
    localStorage.removeItem('michi_arcade_user_id')
    setScreen('home')
  }, [])

  const markGameCompleted = useCallback((gameId: string) => {
    setCompletedIds((prev) => {
      if (prev.has(gameId)) return prev
      const next = new Set(prev)
      next.add(gameId)
      writeJson(STORAGE_KEYS.completedGames, [...next])
      return next
    })
  }, [])

  const addCustomGame = useCallback(async (gameData: Omit<Game, 'id'>) => {
    try {
      const payload = {
        title: gameData.title,
        description: gameData.description || 'Juego añadido manualmente',
        ageRange: gameData.ageRange,
        embedUrl: gameData.embedUrl,
        biome: gameData.biome,
        mapPositionX: gameData.mapPosition.x,
        mapPositionY: gameData.mapPosition.y,
        unlockOrder: gameData.unlockOrder,
        thumbnailUrl: gameData.thumbnailUrl || null,
      }

      const res = await fetch('http://localhost:3000/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Error al registrar juego en el servidor')
      }

      await fetchGames()
    } catch (err) {
      console.error('Error adding custom game to backend, adding locally:', err)
      const newId = `custom-${Date.now()}`
      const newGame: Game = { ...gameData, id: newId }
      setCustomGames((prev) => {
        const updated = [...prev, newGame]
        writeJson(STORAGE_KEYS.customGames, updated)
        return updated
      })
      setGames((prev) => [...prev, newGame])
    }
  }, [fetchGames])

  const openGame = useCallback(
    (game: Game) => {
      if (!isGameUnlocked(game.id)) return
      setActiveGame(game)
    },
    [isGameUnlocked],
  )

  const closeGame = useCallback(() => {
    setActiveGame(null)
  }, [])

  const submitFeedback = useCallback(
    async (gameId: string, stars: 1 | 2 | 3 | 4 | 5) => {
      if (!session) return

      const entry: GameFeedback = {
        gameId,
        stars,
        nickname: session.nickname,
        timestamp: Date.now(),
      }

      setFeedbackList((prev) => {
        const next = [...prev, entry]
        writeJson(STORAGE_KEYS.feedback, next)
        return next
      })
      setPendingFeedbackGameId(null)

      try {
        const userId = localStorage.getItem('michi_arcade_user_id')
        const payload: any = {
          gameId,
          stars,
        }

        if (userId) {
          payload.userId = userId
        } else {
          payload.username = session.nickname
          payload.age = session.age
        }

        const res = await fetch('http://localhost:3000/ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          throw new Error('Error al enviar calificación al servidor')
        }
      } catch (err) {
        console.error('Backend rating sync failed, kept local only:', err)
      }
    },
    [session],
  )

  const feedbackByGameId = useMemo(() => {
    const map: Record<string, GameFeedback[]> = {}
    for (const fb of feedbackList) {
      ; (map[fb.gameId] ??= []).push(fb)
    }
    return map
  }, [feedbackList])

  const getHighScores = useCallback(
    (limit = 20) =>
      aggregateGameStats(allGames, feedbackList).slice(0, limit),
    [allGames, feedbackList],
  )

  const value = useMemo<ArcadeContextValue>(
    () => ({
      screen,
      goToScreen,
      session,
      registerStudent,
      logout,
      allGames,
      gamesForSession,
      isGameUnlocked,
      markGameCompleted,
      completedGameIds: completedIds,
      activeGame,
      openGame,
      closeGame,
      pendingFeedbackGameId,
      setPendingFeedbackGameId,
      submitFeedback,
      feedbackByGameId,
      getHighScores,
      isAdminPanelOpen,
      setAdminPanelOpen,
      isAdminAuthOpen,
      setAdminAuthOpen,
      customGames,
      addCustomGame,
    }),
    [
      screen,
      goToScreen,
      session,
      registerStudent,
      logout,
      allGames,
      gamesForSession,
      isGameUnlocked,
      markGameCompleted,
      completedIds,
      activeGame,
      openGame,
      closeGame,
      pendingFeedbackGameId,
      submitFeedback,
      feedbackByGameId,
      getHighScores,
      isAdminPanelOpen,
      isAdminAuthOpen,
      customGames,
      addCustomGame,
    ],
  )

  return (
    <ArcadeContext.Provider value={value}>{children}</ArcadeContext.Provider>
  )
}
