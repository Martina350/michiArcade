import type {
  AgeRange,
  Game,
  GameFeedback,
  GameStats,
  StudentSession,
} from '../types'

export const REGISTRATION_MIN_AGE = 4
export const REGISTRATION_MAX_AGE = 19

const MIN_AGE = REGISTRATION_MIN_AGE
const MAX_AGE = REGISTRATION_MAX_AGE

export function getNicknameError(nickname: string): string | null {
  const trimmed = nickname.trim()
  if (!trimmed) {
    return '¡Hey! Necesitas un michiname para jugar.'
  }
  if (trimmed.length < 2) {
    return 'Tu michiname debe tener al menos 2 caracteres.'
  }
  if (trimmed.length > 20) {
    return 'El michiname no puede superar los 20 caracteres.'
  }
  if (!/^[\p{L}\p{N}_\s-]+$/u.test(trimmed)) {
    return 'Usa solo letras, números, espacios, guiones o guion bajo.'
  }
  return null
}

export function getAgeError(ageInput: string): string | null {
  const trimmed = ageInput.trim()
  if (!trimmed) {
    return '¿Cuántos años tienes? Escríbelo aquí.'
  }
  if (!/^\d+$/.test(trimmed)) {
    return 'La edad debe ser un número entero, sin letras ni símbolos.'
  }
  const age = Number(trimmed)
  if (age < MIN_AGE) {
    return `Debes tener al menos ${MIN_AGE} años para entrar al arcade.`
  }
  if (age > MAX_AGE) {
    return `La edad máxima permitida es ${MAX_AGE} años.`
  }
  return null
}

export function resolveAgeRange(age: number): AgeRange {
  if (age >= 4 && age <= 9) return 'kids'
  if (age >= 10 && age <= 14) return 'junior'
  return 'teens'
}

export function validateRegistration(
  nickname: string,
  age: number,
): { ok: true } | { ok: false; error: string } {
  const nicknameError = getNicknameError(nickname)
  if (nicknameError) {
    return { ok: false, error: nicknameError }
  }
  const ageError = getAgeError(String(age))
  if (ageError) {
    return { ok: false, error: ageError }
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
  _completedIds: ReadonlySet<string>,
): Set<string> {
  const unlocked = new Set<string>()
  for (const game of gamesInRange) {
    unlocked.add(game.id)
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
