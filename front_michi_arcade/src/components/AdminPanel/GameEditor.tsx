import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useArcade } from '../../hooks/useArcade'
import { PixelInput } from '../UI/PixelInput'
import type { AgeRange } from '../../types'
import { uploadImageToCloudinary } from '../../utils/cloudinary'

export function GameEditor({ onSuccess }: { onSuccess: () => void }) {
  const { allGames, updateGame } = useArcade()

  const [selectedGameId, setSelectedGameId] = useState('')
  const [title, setTitle] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [ageRange, setAgeRange] = useState<AgeRange>('kids')
  const [description, setDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')

  const [loading, setLoading] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [detectedBgColor, setDetectedBgColor] = useState('rgba(0,0,0,0)')

  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageLoad = () => {
    const img = imageRef.current
    if (img) {
      try {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = 1
        tempCanvas.height = 1
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0, 1, 1)
          const pixel = tempCtx.getImageData(0, 0, 1, 1).data
          const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`
          setDetectedBgColor(rgba)
        }
      } catch (e) {
        console.warn('No se pudo extraer el color de fondo', e)
      }
    }
  }

  // Encuentra el juego seleccionado en la lista actual
  const selectedGame = allGames.find((g) => g.id === selectedGameId)

  // Carga los datos del juego en el formulario al seleccionarlo
  useEffect(() => {
    if (selectedGame) {
      setTitle(selectedGame.title)
      setEmbedUrl(selectedGame.embedUrl)
      setAgeRange(selectedGame.ageRange)
      setDescription(selectedGame.description || '')
      setThumbnailUrl(selectedGame.thumbnailUrl || '')
      setImageSrc(null) // Resetea cualquier carga de archivo pendiente
    } else {
      setTitle('')
      setEmbedUrl('')
      setAgeRange('kids')
      setDescription('')
      setThumbnailUrl('')
      setImageSrc(null)
    }
  }, [selectedGame])

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImageSrc(ev.target.result as string)
          setScale(1) // Resetea la escala a 1
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedGameId || !title || !embedUrl) return

    setLoading(true)

    try {
      let finalThumbnailUrl = thumbnailUrl

      // Si el usuario cargó una nueva imagen en el editor, la procesamos y subimos
      if (imageSrc) {
        const canvas = canvasRef.current
        const img = imageRef.current
        if (canvas && img) {
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('No canvas context')

          const targetWidth = 400
          const targetHeight = 200

          canvas.width = targetWidth
          canvas.height = targetHeight

          // Rellena el canvas usando el color de fondo detectado
          ctx.fillStyle = detectedBgColor
          ctx.fillRect(0, 0, targetWidth, targetHeight)

          const scaledWidth = img.naturalWidth * scale
          const scaledHeight = img.naturalHeight * scale

          const x = (targetWidth - scaledWidth) / 2
          const y = (targetHeight - scaledHeight) / 2

          ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => {
              if (b) resolve(b)
              else reject(new Error('Canvas a Blob falló'))
            }, 'image/png')
          })

          finalThumbnailUrl = await uploadImageToCloudinary(blob)
        }
      }

      await updateGame(selectedGameId, {
        title,
        description: description || 'Juego añadido manualmente',
        embedUrl,
        ageRange,
        thumbnailUrl: finalThumbnailUrl || undefined,
      })

      onSuccess()
    } catch (err) {
      console.error(err)
      alert('Hubo un error al actualizar el juego.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 font-pixel text-[8px] text-arcade-cyan">
      <div className="flex flex-col gap-2">
        <label className="text-arcade-gold drop-shadow-md">Selecciona el juego a editar</label>
        <select
          value={selectedGameId}
          onChange={(e) => setSelectedGameId(e.target.value)}
          className="pixel-canvas border-4 border-arcade-cyan bg-black/80 p-3 text-[8px] text-white outline-none"
        >
          <option value="">-- Elige un juego --</option>
          {allGames.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title} ({g.ageRange})
            </option>
          ))}
        </select>
      </div>

      {selectedGameId && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <PixelInput
            label="Nombre del Juego"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Math Quest"
          />

          <PixelInput
            label="URL del Juego (Embed)"
            name="embedUrl"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="Ej: https://juego.com/embed"
          />

          <PixelInput
            label="Descripción Corta"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Aprende sumando..."
          />

          <div className="flex flex-col gap-2">
            <label className="text-arcade-gold drop-shadow-md">Rango de Edad</label>
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value as AgeRange)}
              className="pixel-canvas border-4 border-arcade-cyan bg-black/80 p-3 text-[8px] text-white outline-none"
            >
              <option value="kids">Kids (4-9)</option>
              <option value="junior">Junior (10-14)</option>
              <option value="teens">Teens (15-19)</option>
            </select>
          </div>

          {thumbnailUrl && !imageSrc && (
            <div className="flex flex-col gap-2">
              <label className="text-arcade-gold drop-shadow-md">Imagen Actual</label>
              <div className="relative h-[100px] w-[200px] overflow-hidden border-4 border-[#8f563b] bg-black shadow-inner">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail actual"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-arcade-gold drop-shadow-md">
              {thumbnailUrl ? 'Reemplazar Imagen Promocional' : 'Imagen Promocional (Thumbnail)'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-[8px] file:mr-4 file:border-none file:bg-arcade-cyan file:px-4 file:py-2 file:font-pixel file:text-[8px] file:text-black hover:file:bg-arcade-gold"
            />

            {imageSrc && (
              <div className="mt-4 flex flex-col items-center gap-4 border-4 border-dashed border-[#8f563b] bg-black/40 p-4 w-full">
                <p className="text-[6px] text-white/60">Vista previa interactiva (Simulación de Tarjeta en el Juego)</p>

                {/* Contenedor que imita exactamente la card del juego */}
                <div className="relative h-[200px] w-[400px] overflow-hidden rounded-full border-4 border-arcade-cyan shadow-xl select-none">
                  {/* Fondo del bioma */}
                  <div
                    className={`absolute inset-0 ${
                      ageRange === 'kids'
                        ? 'bg-gradient-to-br from-green-400 to-emerald-800'
                        : ageRange === 'junior'
                          ? 'bg-gradient-to-br from-orange-400 to-red-800'
                          : 'bg-gradient-to-br from-blue-400 to-indigo-800'
                    }`}
                  />

                  {/* Imagen con escala y fondo detectado */}
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ backgroundColor: detectedBgColor }}
                  >
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      alt="Preview"
                      onLoad={handleImageLoad}
                      style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                        objectFit: 'contain',
                      }}
                      className="absolute inset-0 m-auto h-full w-full"
                      draggable={false}
                    />
                  </div>

                  {/* Glassy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-white/10" />

                  {/* Glossy reflection */}
                  <div className="absolute left-0 right-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/40 to-transparent" />

                  {/* Contenido */}
                  <div className="absolute inset-0 flex flex-col items-center justify-between p-6 px-12">
                    <h3 className="font-pixel text-[12px] text-white drop-shadow-[2px_2px_0_#000] text-center max-w-[280px]">
                      {title || 'JUEGO SELECCIONADO'}
                    </h3>

                    <div className="flex w-full items-end justify-between">
                      <div className="flex h-7 items-center justify-center rounded-full bg-black/60 px-4 shadow-inner backdrop-blur-sm">
                        <span className="font-pixel text-[8px] text-white">▶ JUGAR</span>
                      </div>
                      <div className="font-pixel text-[6px] text-arcade-cyan drop-shadow-[1px_1px_0_#000]">
                        [CLICK]
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex w-full max-w-[400px] items-center gap-4">
                  <span className="text-[10px]">➖</span>
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-arcade-gold"
                  />
                  <span className="text-[10px]">➕</span>
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <button
            type="submit"
            disabled={loading || !title || !embedUrl}
            className="mt-6 border-4 border-arcade-gold bg-black px-4 py-3 font-pixel text-[10px] text-arcade-gold transition-colors hover:bg-arcade-gold hover:text-black disabled:cursor-not-allowed disabled:border-gray-600 disabled:text-gray-600 disabled:hover:bg-black"
          >
            {loading ? 'ACTUALIZANDO JUEGO...' : 'GUARDAR CAMBIOS'}
          </button>
        </form>
      )}
    </div>
  )
}
