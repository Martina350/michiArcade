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
  const [scale, setScale] = useState(1)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, targetWidth, targetHeight)

      const scaledWidth = img.naturalWidth * scale
      const scaledHeight = img.naturalHeight * scale

      const x = (targetWidth - scaledWidth) / 2
      const y = (targetHeight - scaledHeight) / 2

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b)
          else reject(new Error('Canvas to Blob falló'))
        }, 'image/jpeg', 0.8)
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
          <div className="mt-4 flex flex-col items-center gap-4 border-4 border-dashed border-[#8f563b] bg-black/40 p-4">
            <p className="text-[6px] text-white/60">Previsualización (recuadro de 400x200)</p>
            
            {/* Contenedor simulando el tamaño final */}
            <div className="relative h-[200px] w-[400px] overflow-hidden bg-black shadow-inner">
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Preview"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'center center',
                  objectFit: 'contain',
                }}
                className="absolute inset-0 m-auto h-full w-full"
              />
            </div>

            <div className="flex w-full items-center gap-4">
              <span className="text-[10px]">➖</span>
              <input
                type="range"
                min="0.5"
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
