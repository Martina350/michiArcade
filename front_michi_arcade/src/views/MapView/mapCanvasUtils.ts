import type { Game, MapBiome } from '../../types'

export const CANVAS_WIDTH = 640
export const CANVAS_HEIGHT = 400
export const NODE_RADIUS = 22

export const BIOME_PALETTES: Record<
  MapBiome,
  { sky: string; ground: string; path: string; accent: string }
> = {
  meadow: {
    sky: '#87CEEB',
    ground: '#4CAF50',
    path: '#8D6E63',
    accent: '#FFD54F',
  },
  canyon: {
    sky: '#FF8A65',
    ground: '#BF360C',
    path: '#5D4037',
    accent: '#FFD54F',
  },
  sky: {
    sky: '#7E57C2',
    ground: '#3949AB',
    path: '#B39DDB',
    accent: '#FFD54F',
  },
}

export function getBiomeFromGames(games: Game[]): MapBiome {
  return games[0]?.biome ?? 'meadow'
}

export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  ctx.fillStyle = color
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h))
}

export function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  drawPixelRect(ctx, x, y, 24, 12, 'rgba(255,255,255,0.9)')
  drawPixelRect(ctx, x + 8, y - 8, 32, 14, 'rgba(255,255,255,0.9)')
  drawPixelRect(ctx, x + 28, y, 20, 10, 'rgba(255,255,255,0.9)')
}

export function sortGamesByOrder(games: Game[]): Game[] {
  return [...games].sort((a, b) => a.unlockOrder - b.unlockOrder)
}
