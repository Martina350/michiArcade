import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useArcade } from '../../hooks/useArcade'
import { PixelInput } from '../UI/PixelInput'
import { AGE_RANGE_LABELS } from '../../types'
import type { AgeRange, Game } from '../../types'
import { uploadImageToCloudinary } from '../../utils/cloudinary'

export function GameManager({ onSuccess }: { onSuccess: () => void }) {
  const { allGames, updateGame, deleteGame } = useArcade()

  // ---------- Estado de la lista ----------
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingGame, setEditingGame] = useState<Game | null>(null)

  // ---------- Estado del formulario de edición ----------
  const [title, setTitle] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [ageRange, setAgeRange] = useState<AgeRange>('kids')
  const [description, setDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [coverScale, setCoverScale] = useState(1)
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null)
  const [detectedBgColor, setDetectedBgColor] = useState('rgba(0,0,0,0)')
  const [saving, setSaving] = useState(false)

  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Precarga los campos cuando se selecciona un juego para editar
  useEffect(() => {
    if (editingGame) {
      setTitle(editingGame.title)
      setEmbedUrl(editingGame.embedUrl)
      setAgeRange(editingGame.ageRange)
      setDescription(editingGame.description || '')
      setThumbnailUrl(editingGame.thumbnailUrl || '')
      setImageSrc(null)
      setScale(1)
      setCoverScale(1)
      setImgDimensions(null)
    }
  }, [editingGame])

  // ---- Handlers imagen ----
  const handleImageLoad = () => {
    const img = imageRef.current
    if (!img) return
    const w = img.naturalWidth
    const h = img.naturalHeight
    setImgDimensions({ width: w, height: h })
    setCoverScale(Math.max(400 / w, 200 / h))
    setScale(1)
    try {
      const tmp = document.createElement('canvas')
      tmp.width = 1; tmp.height = 1
      const ctx = tmp.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1, 1)
        const p = ctx.getImageData(0, 0, 1, 1).data
        setDetectedBgColor(`rgba(${p[0]},${p[1]},${p[2]},${p[3] / 255})`)
      }
    } catch {}
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) setImageSrc(ev.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  // ---- Eliminar ----
  const handleDelete = async (game: Game) => {
    const confirmed = window.confirm(
      `¿Eliminar "${game.title}"? Esta acción borrará también todas sus calificaciones y no se puede deshacer.`
    )
    if (!confirmed) return
    setLoadingId(game.id)
    try {
      await deleteGame(game.id)
      if (editingGame?.id === game.id) setEditingGame(null)
    } catch {
      alert('Error al eliminar el juego.')
    } finally {
      setLoadingId(null)
    }
  }

  // ---- Guardar edición ----
  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingGame) return
    setSaving(true)
    try {
      let finalThumbnailUrl = thumbnailUrl
      if (imageSrc) {
        const canvas = canvasRef.current
        const img = imageRef.current
        if (canvas && img) {
          const ctx = canvas.getContext('2d')!
          const W = 400, H = 200
          canvas.width = W; canvas.height = H
          ctx.fillStyle = detectedBgColor
          ctx.fillRect(0, 0, W, H)
          const as = coverScale * scale
          const sw = img.naturalWidth * as
          const sh = img.naturalHeight * as
          ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh)
          const blob = await new Promise<Blob>((res, rej) =>
            canvas.toBlob((b) => b ? res(b) : rej(new Error('blob fail')), 'image/png')
          )
          finalThumbnailUrl = await uploadImageToCloudinary(blob)
        }
      }
      await updateGame(editingGame.id, {
        title,
        description: description || 'Juego añadido manualmente',
        embedUrl,
        ageRange,
        thumbnailUrl: finalThumbnailUrl || undefined,
      })
      setEditingGame(null)
      onSuccess()
    } catch {
      alert('Error al guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  // ---- Derivados para preview ----
  const actualScale = coverScale * scale
  const previewWidth = imgDimensions ? imgDimensions.width * actualScale : 400
  const previewHeight = imgDimensions ? imgDimensions.height * actualScale : 200
  const previewLeft = (400 - previewWidth) / 2
  const previewTop = (200 - previewHeight) / 2

  // ===================== RENDER =====================
  return (
    <div className="flex flex-col gap-4 font-pixel text-[8px] text-arcade-cyan">

      {/* ---- Lista de juegos ---- */}
      <p className="text-arcade-gold">
        {allGames.length} juego(s) registrado(s).
      </p>

      <div className="flex flex-col gap-2">
        {allGames.map((game) => {
          const isThisLoading = loadingId === game.id
          const isEditing = editingGame?.id === game.id

          return (
            <div key={game.id} className="flex flex-col border-2 border-[#8f563b] bg-black/40">
              {/* Fila principal */}
              <div className="flex items-center gap-3 p-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0 h-12 w-20 overflow-hidden rounded-sm border border-[#8f563b]">
                  {game.thumbnailUrl ? (
                    <img
                      src={game.thumbnailUrl}
                      alt={game.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <span className="text-[6px] text-white/40">SIN IMG</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <span className="truncate font-bold text-white">{game.title}</span>
                  <span className="text-arcade-gold text-[6px]">{AGE_RANGE_LABELS[game.ageRange]}</span>
                </div>

                {/* Botones */}
                <div className="flex flex-shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={isThisLoading || !!loadingId}
                    onClick={() => setEditingGame(isEditing ? null : game)}
                    className={`border-2 px-3 py-2 font-pixel text-[8px] transition-colors
                      ${isEditing
                        ? 'border-arcade-cyan bg-arcade-cyan text-black'
                        : 'border-arcade-gold text-arcade-gold hover:bg-arcade-gold hover:text-black'
                      }
                      disabled:cursor-not-allowed disabled:border-gray-600 disabled:text-gray-600`}
                  >
                    {isEditing ? '✕ CERRAR' : '✎ EDITAR'}
                  </button>
                  <button
                    type="button"
                    disabled={isThisLoading || !!loadingId}
                    onClick={() => handleDelete(game)}
                    className={`border-2 px-3 py-2 font-pixel text-[8px] transition-colors
                      ${isThisLoading
                        ? 'animate-pulse border-gray-600 text-gray-500'
                        : 'border-red-600 text-red-500 hover:bg-red-600 hover:text-black'
                      }
                      disabled:cursor-not-allowed disabled:border-gray-600 disabled:text-gray-600`}
                  >
                    {isThisLoading ? '...' : '✕ ELIMINAR'}
                  </button>
                </div>
              </div>

              {/* Formulario de edición expandible */}
              {isEditing && (
                <form
                  onSubmit={handleSave}
                  className="flex flex-col gap-4 border-t-2 border-[#8f563b] p-4 bg-black/60"
                >
                  <p className="text-arcade-gold">Editando: <span className="text-white">{editingGame?.title}</span></p>

                  <PixelInput label="Nombre del Juego" name="title" value={title}
                    onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Math Quest" />

                  <PixelInput label="URL del Juego (Embed)" name="embedUrl" value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)} placeholder="Ej: https://juego.com/embed" />

                  <PixelInput label="Descripción Corta" name="description" value={description}
                    onChange={(e) => setDescription(e.target.value)} placeholder="Aprende sumando..." />

                  <div className="flex flex-col gap-2">
                    <label className="text-arcade-gold drop-shadow-md">Rango de Edad</label>
                    <select value={ageRange} onChange={(e) => setAgeRange(e.target.value as AgeRange)}
                      className="pixel-canvas border-4 border-arcade-cyan bg-black/80 p-3 text-[8px] text-white outline-none">
                      <option value="kids">Kids (4-9)</option>
                      <option value="junior">Junior (10-14)</option>
                      <option value="teens">Teens (15-19)</option>
                    </select>
                  </div>

                  {/* Imagen actual */}
                  {thumbnailUrl && !imageSrc && (
                    <div className="flex flex-col gap-2">
                      <label className="text-arcade-gold drop-shadow-md">Imagen Actual</label>
                      <div className="relative h-[80px] w-[160px] overflow-hidden border-2 border-[#8f563b] bg-black">
                        <img src={thumbnailUrl} alt="Actual" className="h-full w-full object-cover" draggable={false} />
                      </div>
                    </div>
                  )}

                  {/* Upload nueva imagen */}
                  <div className="flex flex-col gap-2">
                    <label className="text-arcade-gold drop-shadow-md">
                      {thumbnailUrl ? 'Reemplazar Imagen' : 'Imagen Promocional'}
                    </label>
                    <input type="file" accept="image/*" onChange={handleImageUpload}
                      className="text-[8px] file:mr-4 file:border-none file:bg-arcade-cyan file:px-4 file:py-2 file:font-pixel file:text-[8px] file:text-black hover:file:bg-arcade-gold" />

                    {imageSrc && (
                      <div className="mt-2 flex flex-col items-center gap-3 border-2 border-dashed border-[#8f563b] bg-black/40 p-3 w-full">
                        <p className="text-[6px] text-white/60">Vista previa — Simulación de la Card en el Juego</p>

                        {/* Card simulada */}
                        <div className="relative h-[160px] w-[320px] overflow-hidden rounded-full border-4 border-arcade-cyan shadow-xl select-none">
                          <div className={`absolute inset-0 ${ageRange === 'kids' ? 'bg-gradient-to-br from-green-400 to-emerald-800' : ageRange === 'junior' ? 'bg-gradient-to-br from-orange-400 to-red-800' : 'bg-gradient-to-br from-blue-400 to-indigo-800'}`} />
                          <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: detectedBgColor }}>
                            <img ref={imageRef} src={imageSrc} alt="Preview" onLoad={handleImageLoad}
                              style={{ width: `${previewWidth * 0.8}px`, height: `${previewHeight * 0.8}px`, left: `${previewLeft * 0.8}px`, top: `${previewTop * 0.8}px`, position: 'absolute' }}
                              className="max-w-none max-h-none m-0" draggable={false} />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-white/10" />
                          <div className="absolute left-0 right-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/40 to-transparent" />
                          <div className="absolute inset-0 flex flex-col items-center justify-between p-4 px-8">
                            <h3 className="font-pixel text-[10px] text-white drop-shadow-[2px_2px_0_#000] text-center">{title || 'JUEGO'}</h3>
                            <div className="flex w-full items-end justify-between">
                              <div className="flex h-6 items-center rounded-full bg-black/60 px-3 backdrop-blur-sm">
                                <span className="font-pixel text-[7px] text-white">▶ JUGAR</span>
                              </div>
                              <span className="font-pixel text-[5px] text-arcade-cyan">[CLICK]</span>
                            </div>
                          </div>
                        </div>

                        {/* Slider */}
                        <div className="flex w-full max-w-[320px] items-center gap-3">
                          <span className="text-[10px]">➖</span>
                          <input type="range" min="0.2" max="3" step="0.05" value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="w-full accent-arcade-gold" />
                          <span className="text-[10px]">➕</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <canvas ref={canvasRef} className="hidden" />

                  <div className="flex gap-3">
                    <button type="submit" disabled={saving || !title || !embedUrl}
                      className="flex-1 border-4 border-arcade-gold bg-black px-4 py-3 font-pixel text-[10px] text-arcade-gold transition-colors hover:bg-arcade-gold hover:text-black disabled:cursor-not-allowed disabled:border-gray-600 disabled:text-gray-600">
                      {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                    </button>
                    <button type="button" onClick={() => setEditingGame(null)}
                      className="border-4 border-[#8f563b] bg-black px-4 py-3 font-pixel text-[10px] text-white/60 transition-colors hover:bg-[#8f563b] hover:text-white">
                      CANCELAR
                    </button>
                  </div>
                </form>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
