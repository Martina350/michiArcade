import { useState } from 'react'

interface StarRatingProps {
  onSubmit: (stars: 1 | 2 | 3 | 4 | 5) => void
  gameTitle?: string
}

export function StarRating({ onSubmit, gameTitle }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)

  const handleSelect = (stars: 1 | 2 | 3 | 4 | 5) => {
    setSelected(stars)
    onSubmit(stars)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {gameTitle && (
        <p className="font-pixel text-[8px] text-arcade-gold">
          ¿Cómo estuvo {gameTitle}?
        </p>
      )}
      <div className="flex gap-2" role="group" aria-label="Calificación">
        {([1, 2, 3, 4, 5] as const).map((star) => {
          const active = star <= (hovered || selected)
          return (
            <button
              key={star}
              type="button"
              aria-label={`${star} estrellas`}
              className={[
                'font-pixel text-2xl leading-none transition-none',
                active ? 'text-arcade-gold scale-110' : 'text-arcade-cyan/40',
              ].join(' ')}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => handleSelect(star)}
            >
              ★
            </button>
          )
        })}
      </div>
      <p className="font-pixel text-[6px] text-arcade-cyan/70">
        Toca una estrella para votar
      </p>
    </div>
  )
}
