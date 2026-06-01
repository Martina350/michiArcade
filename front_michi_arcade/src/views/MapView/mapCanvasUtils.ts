import type { Game, MapBiome } from '../../types'

export const CANVAS_WIDTH = 640
export const CANVAS_HEIGHT = 400
export const GRID_COLS = 17
export const GRID_ROWS = 12

export const CELL_WIDTH = CANVAS_WIDTH / GRID_COLS
export const CELL_HEIGHT = CANVAS_HEIGHT / GRID_ROWS

export interface GridNode {
  id: string
  type: 'START' | 'LEVEL' | 'NODE' | 'LOCKED_DOOR' | 'FORTRESS' | 'SPADE_GAME' | 'MUSHROOM_HOUSE' | 'BRIDGE' | 'ENEMY' | 'CASTLE'
  col: number
  row: number
  levelNumber?: number // 1 to 3
  connections: {
    up?: string
    down?: string
    left?: string
    right?: string
  }
}

// Map 1: Niñez (Meadow / mapa1.png) - Grass Map layout
export const MAP_NODES_MEADOW: Record<string, GridNode> = {
  start: {
    id: 'start',
    type: 'START',
    col: 2,
    row: 3,
    connections: { right: 'level_1' }
  },
  level_1: {
    id: 'level_1',
    type: 'LEVEL',
    col: 5,
    row: 1,
    levelNumber: 1,
    connections: { left: 'start', right: 'level_2' }
  },
  level_2: {
    id: 'level_2',
    type: 'LEVEL',
    col: 9,
    row: 1,
    levelNumber: 2,
    connections: { left: 'level_1', right: 'level_3' }
  },
  level_3: {
    id: 'level_3',
    type: 'LEVEL',
    col: 13,
    row: 1,
    levelNumber: 3,
    connections: { left: 'level_2', down: 'castle' }
  },
  castle: {
    id: 'castle',
    type: 'CASTLE',
    col: 15,
    row: 10,
    connections: { up: 'level_3' }
  }
}

// Map 2: Juventud (Canyon / mapa2.png) - Water Map layout
export const MAP_NODES_CANYON: Record<string, GridNode> = {
  start: {
    id: 'start',
    type: 'START',
    col: 2,
    row: 3,
    connections: { right: 'level_1' }
  },
  level_1: {
    id: 'level_1',
    type: 'LEVEL',
    col: 10,
    row: 3,
    levelNumber: 1,
    connections: { left: 'start', right: 'level_2' }
  },
  level_2: {
    id: 'level_2',
    type: 'LEVEL',
    col: 12,
    row: 3,
    levelNumber: 2,
    connections: { left: 'level_1', down: 'level_3' }
  },
  level_3: {
    id: 'level_3',
    type: 'LEVEL',
    col: 12,
    row: 8,
    levelNumber: 3,
    connections: { up: 'level_2', left: 'castle' }
  },
  castle: {
    id: 'castle',
    type: 'CASTLE',
    col: 9,
    row: 5,
    connections: { right: 'level_3' }
  }
}

// Map 3: Legado (Sky / mapa3.png) - Autumn Ruins layout
export const MAP_NODES_SKY: Record<string, GridNode> = {
  start: {
    id: 'start',
    type: 'START',
    col: 2,
    row: 3,
    connections: { right: 'level_1' }
  },
  level_1: {
    id: 'level_1',
    type: 'LEVEL',
    col: 6,
    row: 3,
    levelNumber: 1,
    connections: { left: 'start', right: 'level_2' }
  },
  level_2: {
    id: 'level_2',
    type: 'LEVEL',
    col: 10,
    row: 3,
    levelNumber: 2,
    connections: { left: 'level_1', right: 'level_3' }
  },
  level_3: {
    id: 'level_3',
    type: 'LEVEL',
    col: 14,
    row: 3,
    levelNumber: 3,
    connections: { left: 'level_2', down: 'castle' }
  },
  castle: {
    id: 'castle',
    type: 'CASTLE',
    col: 14,
    row: 9,
    connections: { up: 'level_3' }
  }
}

export function getMapNodesForBiome(biome: MapBiome): Record<string, GridNode> {
  if (biome === 'canyon') return MAP_NODES_CANYON
  if (biome === 'sky') return MAP_NODES_SKY
  return MAP_NODES_MEADOW
}

export const BIOME_PALETTES: Record<
  MapBiome,
  {
    sky: string
    ground: string
    pathBorder: string
    pathCenter: string
    borderPipe: string
    borderPipeHighlight: string
    text: string
  }
> = {
  meadow: {
    sky: '#FFF9DB',
    ground: '#78E08F',
    pathBorder: '#57606F',
    pathCenter: '#F8C291',
    borderPipe: '#2F3542',
    borderPipeHighlight: '#747D8C',
    text: '#2F3542'
  },
  canyon: {
    sky: '#0A79DF',
    ground: '#F8EFBA',
    pathBorder: '#1E3799',
    pathCenter: '#ECCC68',
    borderPipe: '#05C46B',
    borderPipeHighlight: '#0BE881',
    text: '#0A79DF'
  },
  sky: {
    sky: '#1E0B36',
    ground: '#572E7A',
    pathBorder: '#2C1B47',
    pathCenter: '#D4AF37',
    borderPipe: '#8C7AE6',
    borderPipeHighlight: '#9C88FF',
    text: '#D4AF37'
  }
}

export function getCanvasCoords(col: number, row: number) {
  const x = (col - 1) * CELL_WIDTH + CELL_WIDTH / 2
  const y = (row - 1) * CELL_HEIGHT + CELL_HEIGHT / 2
  return { x, y }
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

export function drawBorder(ctx: CanvasRenderingContext2D, biome: MapBiome): void {
  const p = BIOME_PALETTES[biome]
  
  // Hollow frame border around the canvas edges
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, CANVAS_WIDTH, 2)
  ctx.fillRect(0, CANVAS_HEIGHT - 2, CANVAS_WIDTH, 2)
  ctx.fillRect(0, 0, 2, CANVAS_HEIGHT)
  ctx.fillRect(CANVAS_WIDTH - 2, 0, 2, CANVAS_HEIGHT)

  ctx.fillStyle = p.borderPipe
  ctx.fillRect(2, 2, CANVAS_WIDTH - 4, 8)
  ctx.fillRect(2, CANVAS_HEIGHT - 10, CANVAS_WIDTH - 4, 8)
  ctx.fillRect(2, 2, 8, CANVAS_HEIGHT - 4)
  ctx.fillRect(CANVAS_WIDTH - 10, 2, 8, CANVAS_HEIGHT - 4)

  ctx.fillStyle = p.borderPipeHighlight
  ctx.fillRect(4, 4, CANVAS_WIDTH - 8, 2)
  ctx.fillRect(4, 4, 2, CANVAS_HEIGHT - 8)

  ctx.fillStyle = '#000000'
  ctx.fillRect(10, 10, CANVAS_WIDTH - 20, 2)
  ctx.fillRect(10, CANVAS_HEIGHT - 12, CANVAS_WIDTH - 20, 2)
  ctx.fillRect(10, 10, 2, CANVAS_HEIGHT - 20)
  ctx.fillRect(CANVAS_WIDTH - 12, 10, 2, CANVAS_HEIGHT - 20)
}

// Start Panel
export function drawStartTile(ctx: CanvasRenderingContext2D, col: number, row: number, biome: MapBiome, isHovered: boolean): void {
  const { x, y } = getCanvasCoords(col, row)
  const w = CELL_WIDTH * 1.3
  const h = CELL_HEIGHT * 0.9
  const bounce = isHovered ? Math.floor(Math.sin(Date.now() * 0.01) * 2) : 0

  drawPixelRect(ctx, x - w / 2 - 2, y - h / 2 - 2 + bounce, w + 4, h + 4, '#000000')

  const bg = biome === 'meadow' ? '#E84118' : biome === 'canyon' ? '#E15F41' : '#8C7AE6'
  drawPixelRect(ctx, x - w / 2, y - h / 2 + bounce, w, h, bg)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 9px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('START', x, y + bounce)
}

// Level Tile
export function drawLevelTile(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  levelNumber: number,
  isUnlocked: boolean,
  isCompleted: boolean,
  isHovered: boolean
): void {
  const { x, y } = getCanvasCoords(col, row)
  const w = CELL_WIDTH * 0.9
  const h = CELL_HEIGHT * 0.9
  const scale = isHovered ? 2 : 0

  drawPixelRect(ctx, x - w / 2 - 2 - scale, y - h / 2 - 2 - scale, w + 4 + scale * 2, h + 4 + scale * 2, '#000000')

  const bg = isUnlocked ? (isCompleted ? '#FFD54F' : '#000000') : '#555555'
  drawPixelRect(ctx, x - w / 2 - scale, y - h / 2 - scale, w + scale * 2, h + scale * 2, bg)

  if (isUnlocked) {
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    ctx.strokeRect(x - w / 2 + 2 - scale, y - h / 2 + 2 - scale, w - 4 + scale * 2, h - 4 + scale * 2)
  }

  ctx.fillStyle = isUnlocked ? (isCompleted ? '#000000' : '#FFFFFF') : '#999999'
  ctx.font = 'bold 12px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  if (isCompleted) {
    ctx.fillText('★', x, y - 1)
  } else {
    ctx.fillText(String(levelNumber), x, y)
  }
}

// Castle Final with HELP bubble
export function drawCastleTile(ctx: CanvasRenderingContext2D, col: number, row: number, biome: MapBiome, frame: number, onlyDrawHelp?: boolean): void {
  const { x, y } = getCanvasCoords(col, row)
  const w = CELL_WIDTH * 1.6
  const h = CELL_HEIGHT * 1.5
  const animY = Math.sin(frame * 0.05) * 1

  if (!onlyDrawHelp) {
    ctx.fillStyle = '#000000'
    ctx.fillRect(x - w / 2, y - h / 2 + animY, w, h)

    const stoneColor = biome === 'meadow' ? '#BDC3C7' : biome === 'canyon' ? '#F5F6FA' : '#7F8C8D'
    drawPixelRect(ctx, x - w / 2 + 3, y - h / 2 + 8 + animY, w - 6, h - 8, stoneColor)

    drawPixelRect(ctx, x - 6, y + h / 2 - 10 + animY, 12, 10, '#000000')

    const roofColor = biome === 'sky' ? '#8C7AE6' : '#E84118'
    ctx.fillStyle = roofColor
    ctx.beginPath()
    ctx.moveTo(x - w / 2 + 1, y - h / 2 + 8 + animY)
    ctx.lineTo(x - w / 4, y - h / 2 - 2 + animY)
    ctx.lineTo(x - 3, y - h / 2 + 8 + animY)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(x + 3, y - h / 2 + 8 + animY)
    ctx.lineTo(x + w / 4, y - h / 2 - 2 + animY)
    ctx.lineTo(x + w / 2 - 1, y - h / 2 + 8 + animY)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // --- HELP Bubble floating ---
  const helpY = y - h / 2 - 18 + Math.sin(frame * 0.08) * 3

  drawPixelRect(ctx, x - 18, helpY - 7, 36, 12, '#000000')
  drawPixelRect(ctx, x - 17, helpY - 6, 34, 10, '#FFFFFF')

  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.moveTo(x - 3, helpY + 5)
  ctx.lineTo(x + 3, helpY + 5)
  ctx.lineTo(x, helpY + 8)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.moveTo(x - 2, helpY + 4)
  ctx.lineTo(x + 2, helpY + 4)
  ctx.lineTo(x, helpY + 6)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#FF3030'
  ctx.font = 'bold 8px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('HELP', x, helpY - 1)
}

export function sortGamesByOrder(games: Game[]): Game[] {
  return [...games].sort((a, b) => a.unlockOrder - b.unlockOrder)
}

export function getBiomeFromGames(games: Game[]): MapBiome {
  return games[0]?.biome ?? 'meadow'
}
