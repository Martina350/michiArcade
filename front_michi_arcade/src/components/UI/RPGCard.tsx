import type { ReactNode } from 'react'

interface RPGCardProps {
  children: ReactNode
  title?: string
  className?: string
}

export function RPGCard({ children, title, className = '' }: RPGCardProps) {
  return (
    <div
      className={[
        'relative border-4 border-arcade-cyan bg-arcade-blue p-6 text-left shadow-[8px_8px_0_0_#000]',
        className,
      ].join(' ')}
    >
      {title && (
        <div className="mb-4 border-b-4 border-arcade-gold pb-2">
          <h2 className="font-pixel text-[10px] uppercase text-arcade-gold">
            {title}
          </h2>
        </div>
      )}
      <div className="font-pixel text-[8px] leading-loose text-arcade-cyan">
        {children}
      </div>
    </div>
  )
}
