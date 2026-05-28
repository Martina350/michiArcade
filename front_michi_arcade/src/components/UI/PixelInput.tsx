import type { InputHTMLAttributes } from 'react'

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function PixelInput({ label, className = '', id, ...props }: PixelInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s/g, '-')

  return (
    <label htmlFor={inputId} className="flex w-full flex-col gap-2 text-left">
      <span className="font-pixel text-[8px] uppercase text-arcade-gold">
        {label}
      </span>
      <input
        id={inputId}
        className={[
          'font-pixel w-full border-4 border-arcade-cyan bg-arcade-dark px-3 py-3 text-[10px] text-arcade-cyan outline-none focus:border-arcade-gold focus:ring-0',
          className,
        ].join(' ')}
        {...props}
      />
    </label>
  )
}
