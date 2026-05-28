import type {
  AgeRange,
  Game,
  GameFeedback,
  GameStats,
  StudentSession,
} from '../types'

const MIN_AGE = 6
const MAX_AGE = 99

export function resolveAgeRange(age: number): AgeRange {
  if (age >= 6 && age <= 9) return 'junior'
  if (age >= 10 && age <= 13) return 'master'
  return 'legend'
}

export function validateRegistration(
  nickname: string,
  age: number,
): { ok: true } | { ok: false; error: string } {
  const trimmed = nickname.trim()
  if (trimmed.length < 2) {
    return { ok: false, error: 'El nickname debe tener al menos 2 caracteres.' }
  }
  if (!Number.isInteger(age) || age < MIN_AGE || age > MAX_AGE) {
    return {
      ok: false,
      error: `La edad debe ser un número entre ${MIN_AGE} y ${MAX_AGE}.`,
    }
  }
  return { ok: true }
}

export function createSession(nickname: string, age: number): StudentSession {
  const trimmed = nickname.trim()
  return {
    nickname: trimmed,
    age,
    ageRange: resolveAgeRange(age),
    createdAt: new Date().toISOString(),
  }
}

export function filterGamesByAgeRange(
  games: readonly Game[],
  ageRange: AgeRange,
): Game[] {
  return games.filter((g) => g.ageRange === ageRange)
}

export function computeUnlockedGameIds(
  gamesInRange: readonly Game[],
  completedIds: ReadonlySet<string>,
): Set<string> {
  const sorted = [...gamesInRange].sort(
    (a, b) => a.unlockOrder - b.unlockOrder,
  )
  const unlocked = new Set<string>()

  for (let i = 0; i < sorted.length; i++) {
    const game = sorted[i]
    if (i === 0) {
      unlocked.add(game.id)
      continue
    }
    const prev = sorted[i - 1]
    if (completedIds.has(prev.id)) {
      unlocked.add(game.id)
    } else {
      break
    }
  }
  return unlocked
}

export function aggregateGameStats(
  games: readonly Game[],
  feedbackList: readonly GameFeedback[],
): GameStats[] {
  const byGame = new Map<
    string,
    { sum: number; count: number; title: string; ageRange: AgeRange }
  >()

  for (const game of games) {
    byGame.set(game.id, {
      sum: 0,
      count: 0,
      title: game.title,
      ageRange: game.ageRange,
    })
  }

  for (const fb of feedbackList) {
    const entry = byGame.get(fb.gameId)
    if (!entry) continue
    entry.sum += fb.stars
    entry.count += 1
  }

  const stats: GameStats[] = []
  for (const [gameId, { sum, count, title, ageRange }] of byGame) {
    if (count === 0) continue
    stats.push({
      gameId,
      title,
      ageRange,
      totalVotes: count,
      averageStars: Math.round((sum / count) * 10) / 10,
    })
  }

  return stats.sort((a, b) => {
    if (b.averageStars !== a.averageStars) {
      return b.averageStars - a.averageStars
    }
    return b.totalVotes - a.totalVotes
  })
}
