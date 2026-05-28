import { useCallback, useEffect, useRef } from 'react'
import type { Game } from '../../types'
import {
  BIOME_PALETTES,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  drawCloud,
  drawPixelRect,
  getBiomeFromGames,
  NODE_RADIUS,
  sortGamesByOrder,
} from './mapCanvasUtils'

interface MapCanvasProps {
  games: Game[]
  isUnlocked: (gameId: string) => boolean
  isCompleted: (gameId: string) => boolean
  onNodeClick: (game: Game) => void
}

export function MapCanvas({
  games,
  isUnlocked,
  isCompleted,
  onNodeClick,
}: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gamesRef = useRef(games)

  gamesRef.current = games

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sorted = sortGamesByOrder(gamesRef.current)
    const biome = getBiomeFromGames(sorted)
    const palette = BIOME_PALETTES[biome]

    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    drawPixelRect(ctx, 0, 0, CANVAS_WIDTH, 140, palette.sky)
    drawCloud(ctx, 80, 40)
    drawCloud(ctx, 320, 60)
    drawCloud(ctx, 500, 35)

    drawPixelRect(ctx, 0, 140, CANVAS_WIDTH, 60, palette.ground)
    drawPixelRect(ctx, 0, 200, CANVAS_WIDTH, 200, '#2E7D32')

    for (let i = 0; i < 8; i++) {
      drawPixelRect(ctx, i * 90, 210, 40, 16, '#1B5E20')
      drawPixelRect(ctx, i * 90 + 50, 195, 30, 20, '#388E3C')
    }

    if (sorted.length > 1) {
      ctx.strokeStyle = palette.path
      ctx.lineWidth = 10
      ctx.lineCap = 'square'
      ctx.beginPath()
      const first = sorted[0].mapPosition
      ctx.moveTo(first.x, first.y)
      for (let i = 1; i < sorted.length; i++) {
        const pos = sorted[i].mapPosition
        const prev = sorted[i - 1].mapPosition
        const midX = (prev.x + pos.x) / 2
        ctx.lineTo(midX, prev.y)
        ctx.lineTo(midX, pos.y)
        ctx.lineTo(pos.x, pos.y)
      }
      ctx.stroke()
    }

    sorted.forEach((game, index) => {
      const { x, y } = game.mapPosition
      const unlocked = isUnlocked(game.id)
      const completed = isCompleted(game.id)

      drawPixelRect(ctx, x - 28, y + 18, 56, 12, unlocked ? '#5D4037' : '#424242')

      ctx.fillStyle = unlocked
        ? completed
          ? palette.accent
          : '#0D47A1'
        : '#616161'
      ctx.beginPath()
      ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#000'
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.fillStyle = unlocked ? '#E0F7FF' : '#9E9E9E'
      ctx.font = 'bold 14px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(index + 1), x, y - 2)

      if (!unlocked) {
        ctx.fillStyle = '#000'
        ctx.font = '16px monospace'
        ctx.fillText('🔒', x, y - 28)
      } else if (completed) {
        ctx.fillText('★', x, y - 30)
      }

      ctx.fillStyle = '#fff'
      ctx.font = '10px monospace'
      ctx.fillText(game.title.slice(0, 12), x, y + 38)
    })
  }, [isUnlocked, isCompleted])

  useEffect(() => {
    draw()
  }, [draw, games])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = CANVAS_WIDTH / rect.width
      const scaleY = CANVAS_HEIGHT / rect.height
      const cx = (event.clientX - rect.left) * scaleX
      const cy = (event.clientY - rect.top) * scaleY

      for (const game of gamesRef.current) {
        if (!isUnlocked(game.id)) continue
        const { x, y } = game.mapPosition
        const dx = cx - x
        const dy = cy - y
        if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS * 1.8) {
          onNodeClick(game)
          return
        }
      }
    }

    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [isUnlocked, onNodeClick])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="pixel-canvas w-full max-w-4xl cursor-crosshair border-4 border-black"
      aria-label="Mapa de niveles del arcade"
    />
  )
}
