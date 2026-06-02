import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useArcade } from '../../hooks/useArcade'
import { PixelInput } from '../UI/PixelInput'
import type { AgeRange } from '../../types'
import { uploadImageToCloudinary } from '../../utils/cloudinary'

export function GameUploader({ onSuccess }: { onSuccess: () => void }) {
  const { addCustomGame } = useArcade()

  const [title, setTitle] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [ageRange, setAgeRange] = useState<AgeRange>('kids')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [scale, setScale] = useState(1) // Multiplicador de escala (1 = cover por defecto)
  const [coverScale, setCoverScale] = useState(1)
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null)
  const [detectedBgColor, setDetectedBgColor] = useState('rgba(0,0,0,0)')
  
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageLoad = () => {
    const img = imageRef.current
    if (img) {
      const w = img.naturalWidth
      const h = img.naturalHeight
      setImgDimensions({ width: w, height: h })

      const cs = Math.max(400 / w, 200 / h)
      setCoverScale(cs)
      setScale(1) // Resetea el multiplicador a 1

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

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImageSrc(ev.target.result as string)
          setScale(1) // Reset scale
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title || !embedUrl || !imageSrc) return

    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    setLoading(true)

    try {
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No canvas context')

      const targetWidth = 400
      const targetHeight = 200

      canvas.width = targetWidth
      canvas.height = targetHeight

      // Rellena el canvas usando el color de fondo detectado
      ctx.fillStyle = detectedBgColor
      ctx.fillRect(0, 0, targetWidth, targetHeight)

      const actualScale = coverScale * scale
      const scaledWidth = img.naturalWidth * actualScale
      const scaledHeight = img.naturalHeight * actualScale

      const x = (targetWidth - scaledWidth) / 2
      const y = (targetHeight - scaledHeight) / 2

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b)
          else reject(new Error('Canvas a Blob falló'))
        }, 'image/png')
      })

      const secureUrl = await uploadImageToCloudinary(blob)

      const biome = ageRange === 'kids' ? 'meadow' : ageRange === 'junior' ? 'canyon' : 'sky'

      addCustomGame({
        title,
        description: description || 'Juego añadido manualmente',
        embedUrl,
        ageRange,
        thumbnailUrl: secureUrl,
        biome,
        mapPosition: { x: 0, y: 0 },
        unlockOrder: 0
      })

      onSuccess()
    } catch (err) {
      console.error(err)
      alert('Hubo un error al subir la imagen a Cloudinary.')
    } finally {
      setLoading(false)
    }
  }

  const actualScale = coverScale * scale
  const previewWidth = imgDimensions ? imgDimensions.width * actualScale : 400
  const previewHeight = imgDimensions ? imgDimensions.height * actualScale : 200
  const previewLeft = (400 - previewWidth) / 2
  const previewTop = (200 - previewHeight) / 2

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-pixel text-[8px] text-arcade-cyan">
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

      <div className="flex flex-col gap-2">
        <label className="text-arcade-gold drop-shadow-md">Imagen Promocional (Thumbnail)</label>
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
                    width: `${previewWidth}px`,
                    height: `${previewHeight}px`,
                    left: `${previewLeft}px`,
                    top: `${previewTop}px`,
                    position: 'absolute',
                  }}
                  className="max-w-none max-h-none m-0"
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
                  {title || 'NUEVO JUEGO'}
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
        disabled={loading || !title || !embedUrl || !imageSrc}
        className="mt-6 border-4 border-arcade-gold bg-black px-4 py-3 font-pixel text-[10px] text-arcade-gold transition-colors hover:bg-arcade-gold hover:text-black disabled:cursor-not-allowed disabled:border-gray-600 disabled:text-gray-600 disabled:hover:bg-black"
      >
        {loading ? 'SUBIENDO E INGRESANDO...' : 'GUARDAR JUEGO'}
      </button>
    </form>
  )
}
