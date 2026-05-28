import type { ButtonHTMLAttributes, ReactNode } from 'react'

type PixelButtonVariant = 'primary' | 'gold' | 'ghost'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: PixelButtonVariant
  fullWidth?: boolean
}

const variantClasses: Record<PixelButtonVariant, string> = {
  primary:
    'bg-arcade-blue text-arcade-cyan border-arcade-cyan hover:bg-[#1565C0] active:translate-y-1',
  gold: 'bg-arcade-gold text-arcade-dark border-black hover:brightness-110 active:translate-y-1',
  ghost:
    'bg-transparent text-arcade-cyan border-arcade-cyan/60 hover:border-arcade-cyan hover:bg-arcade-blue/40',
}

export function PixelButton({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: PixelButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        'font-pixel cursor-pointer border-4 px-4 py-3 text-[10px] leading-relaxed uppercase tracking-wide transition-none disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
