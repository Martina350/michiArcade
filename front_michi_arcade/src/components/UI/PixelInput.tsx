import type { InputHTMLAttributes } from 'react'

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function PixelInput({
  label,
  error,
  className = '',
  id,
  ...props
}: PixelInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s/g, '-')
  const hasError = Boolean(error)

  return (
    <div className="flex w-full flex-col gap-2 text-left">
      <label
        htmlFor={inputId}
        className={[
          'font-pixel text-[8px] uppercase',
          hasError ? 'text-red-400' : 'text-arcade-gold',
        ].join(' ')}
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        className={[
          'font-pixel w-full border-4 bg-arcade-dark px-3 py-3 text-[10px] outline-none focus:ring-0',
          hasError
            ? 'border-red-500 text-red-100 focus:border-red-400'
            : 'border-arcade-cyan text-arcade-cyan focus:border-arcade-gold',
          className,
        ].join(' ')}
        {...props}
      />
      {hasError && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="font-pixel text-[7px] leading-relaxed text-red-400"
        >
          ⚠ {error}
        </p>
      )}
    </div>
  )
}
