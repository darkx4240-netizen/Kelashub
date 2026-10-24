import type { ReactNode } from 'react'
import { useTilt } from '../hooks/useTilt'

interface TiltCardProps {
  children: ReactNode
  className?: string
  /** "tilt" = ikut pointer (rotateX/Y), "lift" = naik tipis tanpa rotasi */
  variant?: 'tilt' | 'lift'
  /** maks. sudut rotasi (deg); default ikut konteks */
  max?: number
}

/** Card 3D dasar: soft shadow + kedalaman + lift saat hover. */
export function TiltCard({ children, className = '', variant = 'tilt', max }: TiltCardProps) {
  const { style, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>(
    variant === 'tilt' ? max : 0,
  )
  const isTilt = variant === 'tilt'

  return (
    <div
      onPointerMove={isTilt ? onPointerMove : undefined}
      onPointerLeave={isTilt ? onPointerLeave : undefined}
      style={isTilt ? style : undefined}
      className={
        `group relative rounded-2xl border border-black/[0.06] bg-white shadow-card ` +
        `transition-[transform,box-shadow] duration-240 ease-[cubic-bezier(0.22,1,0.36,1)] ` +
        `hover:shadow-card-hover ` +
        (isTilt ? '' : 'hover:-translate-y-1 ') +
        className
      }
    >
      {children}
    </div>
  )
}