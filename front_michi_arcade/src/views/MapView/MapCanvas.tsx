import { useCallback, useEffect, useRef, useState } from 'react'
import type { Game } from '../../types'
import {
  BIOME_PALETTES,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  drawBorder,
  drawCastleTile,
  drawLevelTile,
  drawStartTile,
  getBiomeFromGames,
  getCanvasCoords,
  getMapNodesForBiome,
  sortGamesByOrder,
} from './mapCanvasUtils'
import mapa1 from '../../assets/img/mapa1.png'
import mapa2 from '../../assets/img/mapa2.png'
import mapa3 from '../../assets/img/mapa3.png'
import gatoEtapas from '../../assets/img/gatoEtapas.png'

interface MapCanvasProps {
  games: Game[]
  isUnlocked: (gameId: string) => boolean
  isCompleted: (gameId: string) => boolean
  onNodeClick: (game: Game) => void
}

export function MapCanvas({
  games,
  isCompleted,
  onNodeClick,
}: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentNodeId, setCurrentNodeId] = useState<string>('start')
  const [dialogText, setDialogText] = useState<string>(
    '¡Mapa interactivo listo! Usa las Flechas del teclado para moverte y ENTER para jugar.'
  )
  const [frame, setFrame] = useState(0)
  const [avatarImg, setAvatarImg] = useState<{ img: HTMLImageElement; width: number; height: number } | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = gatoEtapas
    img.onload = () => {
      const targetHeight = 32
      const ratio = img.naturalWidth / img.naturalHeight
      const targetWidth = targetHeight * ratio
      setAvatarImg({
        img,
        width: targetWidth,
        height: targetHeight,
      })
    }
  }, [])

  const sorted = sortGamesByOrder(games)
  const biome = getBiomeFromGames(sorted)
  const activeNodes = getMapNodesForBiome(biome)
  const mapImage = biome === 'meadow' ? mapa1 : biome === 'canyon' ? mapa2 : mapa3

  // Reset character position to start when games or biomes change (handled during render)
  const [prevGames, setPrevGames] = useState(games)
  if (games !== prevGames) {
    setPrevGames(games)
    setCurrentNodeId('start')
    setDialogText('¡Has entrado a un nuevo mundo! Usa las Flechas para explorar.')
  }

  // All nodes are unlocked for immediate play testing
  const checkNodeUnlocked = useCallback(
    (nodeId: string): boolean => {
      return !!nodeId
    },
    []
  )

  const triggerNodeAction = useCallback(
    (nodeId: string) => {
      const node = activeNodes[nodeId]
      if (!node) return

      switch (node.type) {
        case 'START':
          setDialogText('🚩 Punto de inicio. ¡Listo para jugar!')
          break
        case 'LEVEL': {
          const lvl = node.levelNumber!
          if (lvl <= 3) {
            const game = games[lvl - 1]
            if (game) {
              const comp = isCompleted(game.id)
              setDialogText(
                `🎮 Nivel ${lvl}: ${game.title} - ${game.description}. ${
                  comp ? '★ ¡Ya lo completaste!' : 'Presiona ENTER o haz clic para Jugar.'
                }`
              )
            }
          } else {
            setDialogText(`🔒 Nivel ${lvl} (Desafío Especial). ¡Próximamente en MichiArcade!`)
          }
          break
        }
        case 'CASTLE':
          setDialogText('👑 ¡Castillo Final del Legado! Fin de la etapa de edad.')
          break
        default:
          setDialogText('▶ Te mueves por los senderos del mapa.')
      }
    },
    [games, isCompleted, activeNodes]
  )

  const handleActivateNode = useCallback(
    (nodeId: string) => {
      const node = activeNodes[nodeId]
      if (node && node.type === 'LEVEL') {
        const lvlNum = node.levelNumber!
        if (lvlNum <= 3) {
          const game = games[lvlNum - 1]
          if (game) {
            onNodeClick(game)
          }
        }
      }
    },
    [games, onNodeClick, activeNodes]
  )

  // Listen to keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault()
      }

      const node = activeNodes[currentNodeId]
      if (!node) return

      let dir: 'up' | 'down' | 'left' | 'right' | null = null
      if (e.key === 'ArrowUp') dir = 'up'
      else if (e.key === 'ArrowDown') dir = 'down'
      else if (e.key === 'ArrowLeft') dir = 'left'
      else if (e.key === 'ArrowRight') dir = 'right'

      if (dir) {
        const nextId = node.connections[dir]
        if (nextId) {
          if (checkNodeUnlocked(nextId)) {
            setCurrentNodeId(nextId)
            triggerNodeAction(nextId)
          }
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        handleActivateNode(currentNodeId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentNodeId, checkNodeUnlocked, triggerNodeAction, handleActivateNode, activeNodes])

  // Mouse clicks handler
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = CANVAS_WIDTH / rect.width
      const scaleY = CANVAS_HEIGHT / rect.height
      const cx = (event.clientX - rect.left) * scaleX
      const cy = (event.clientY - rect.top) * scaleY

      let closestNodeId: string | null = null
      let minDistance = 24 // Click radius

      for (const [id, node] of Object.entries(activeNodes)) {
        const { x, y } = getCanvasCoords(node.col, node.row)
        const dx = cx - x
        const dy = cy - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDistance) {
          closestNodeId = id
          minDistance = dist
        }
      }

      if (closestNodeId) {
        if (checkNodeUnlocked(closestNodeId)) {
          setCurrentNodeId(closestNodeId)
          triggerNodeAction(closestNodeId)
          handleActivateNode(closestNodeId)
        }
      }
    }

    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [checkNodeUnlocked, triggerNodeAction, handleActivateNode, activeNodes])

  // Animation Loop
  useEffect(() => {
    let animId: number
    const update = () => {
      setFrame((f) => f + 1)
      animId = requestAnimationFrame(update)
    }
    animId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const palette = BIOME_PALETTES[biome]

    // Clear canvas so the CSS background image shines through cleanly
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // 1. Draw paths lines on top of the image to show connection paths
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // First pass: Thick outer outline
    ctx.strokeStyle = palette.pathBorder
    ctx.lineWidth = 8
    ctx.beginPath()
    Object.values(activeNodes).forEach((node) => {
      const fromCoords = getCanvasCoords(node.col, node.row)
      if (node.connections.right) {
        const next = activeNodes[node.connections.right]
        if (next) {
          const toCoords = getCanvasCoords(next.col, next.row)
          ctx.moveTo(fromCoords.x, fromCoords.y)
          ctx.lineTo(toCoords.x, toCoords.y)
        }
      }
      if (node.connections.down) {
        const next = activeNodes[node.connections.down]
        if (next) {
          const toCoords = getCanvasCoords(next.col, next.row)
          ctx.moveTo(fromCoords.x, fromCoords.y)
          ctx.lineTo(toCoords.x, toCoords.y)
        }
      }
    })
    ctx.stroke()

    // Second pass: Thinner center path
    ctx.strokeStyle = palette.pathCenter
    ctx.lineWidth = 3
    ctx.beginPath()
    Object.values(activeNodes).forEach((node) => {
      const fromCoords = getCanvasCoords(node.col, node.row)
      if (node.connections.right) {
        const next = activeNodes[node.connections.right]
        if (next) {
          const toCoords = getCanvasCoords(next.col, next.row)
          ctx.moveTo(fromCoords.x, fromCoords.y)
          ctx.lineTo(toCoords.x, toCoords.y)
        }
      }
      if (node.connections.down) {
        const next = activeNodes[node.connections.down]
        if (next) {
          const toCoords = getCanvasCoords(next.col, next.row)
          ctx.moveTo(fromCoords.x, fromCoords.y)
          ctx.lineTo(toCoords.x, toCoords.y)
        }
      }
    })
    ctx.stroke()

    // 2. Draw node points and interactive tiles
    Object.values(activeNodes).forEach((node) => {
      const hovered = currentNodeId === node.id

      switch (node.type) {
        case 'START':
          drawStartTile(ctx, node.col, node.row, biome, hovered)
          break
        case 'LEVEL': {
          const lvl = node.levelNumber!
          let completed = false
          if (lvl <= 3) {
            const game = games[lvl - 1]
            if (game) {
              completed = isCompleted(game.id)
            }
          }
          // All levels are always unlocked (true)
          drawLevelTile(ctx, node.col, node.row, lvl, true, completed, hovered)
          break
        }
        case 'CASTLE':
          // onlyDrawHelp = true: only draw floating HELP bubble, since castle is in the image background
          drawCastleTile(ctx, node.col, node.row, biome, frame, true)
          break
      }
    })

    // 3. Draw the Player's Michi Avatar at the current node position
    const currentPos = activeNodes[currentNodeId]
    if (currentPos) {
      const { x, y } = getCanvasCoords(currentPos.col, currentPos.row)
      const bob = Math.sin(frame * 0.12) * 2

      if (avatarImg) {
        ctx.drawImage(
          avatarImg.img,
          x - avatarImg.width / 2,
          y - avatarImg.height + 8 + bob,
          avatarImg.width,
          avatarImg.height
        )
      } else {
        const cy = y - 4 + bob
        // Ears
        ctx.fillStyle = '#FF9F43'
        ctx.beginPath()
        ctx.moveTo(x - 9, cy - 6)
        ctx.lineTo(x - 4, cy - 14)
        ctx.lineTo(x - 1, cy - 6)
        ctx.moveTo(x + 1, cy - 6)
        ctx.lineTo(x + 4, cy - 14)
        ctx.lineTo(x + 9, cy - 6)
        ctx.fill()
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Inner ears
        ctx.fillStyle = '#FFB8B8'
        ctx.beginPath()
        ctx.moveTo(x - 8, cy - 7)
        ctx.lineTo(x - 5, cy - 11)
        ctx.lineTo(x - 3, cy - 7)
        ctx.moveTo(x + 3, cy - 7)
        ctx.lineTo(x + 5, cy - 11)
        ctx.lineTo(x + 8, cy - 7)
        ctx.fill()

        // Face
        ctx.fillStyle = '#FF9F43'
        ctx.beginPath()
        ctx.arc(x, cy, 9, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Eyes
        ctx.fillStyle = '#000000'
        ctx.fillRect(x - 4, cy - 2, 2, 2)
        ctx.fillRect(x + 2, cy - 2, 2, 2)

        // Pink Nose
        ctx.fillStyle = '#FF8A8A'
        ctx.fillRect(x - 1, cy + 1, 2, 1.5)

        // Whiskers
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x - 8, cy + 1)
        ctx.lineTo(x - 13, cy)
        ctx.moveTo(x - 8, cy + 2)
        ctx.lineTo(x - 14, cy + 3)
        ctx.moveTo(x + 8, cy + 1)
        ctx.lineTo(x + 13, cy)
        ctx.moveTo(x + 8, cy + 2)
        ctx.lineTo(x + 14, cy + 3)
        ctx.stroke()
      }
    }

    // 4. Draw 3D pipe border frame
    drawBorder(ctx, biome)
  }, [currentNodeId, games, isCompleted, frame, checkNodeUnlocked, activeNodes, biome, avatarImg])

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-4xl overflow-hidden rounded bg-black shadow-2xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            backgroundImage: `url(${mapImage})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          className="pixel-canvas h-auto w-full cursor-crosshair"
          aria-label="Mapa de niveles del arcade estilo retro"
        />
      </div>

      {dialogText && (
        <div className="mt-4 w-full max-w-4xl border-4 border-black bg-[#051633] p-3 shadow-lg pixel-border-gold">
          <p className="font-pixel text-[8px] leading-relaxed text-[#e0f7ff]">
            <span className="text-[#ffd54f]">💬 Michi-Guía: </span>
            {dialogText}
          </p>
        </div>
      )}
    </div>
  )
}
