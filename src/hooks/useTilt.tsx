import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

interface MotionPref {
  prefersReduced: boolean
  pointerFine: boolean
}

interface TiltContextValue extends MotionPref {
  /** maks. sudut rotasi (deg) — di-squash kalau user & device tidak mendukung hover halus */
  max: number
}

export const TiltContext = createContext<TiltContextValue>({
  prefersReduced: false,
  pointerFine: true,
  max: 7,
})

export function TiltProvider({ children }: { children: ReactNode }) {
  const [mq, setMq] = useState(() => ({
    prefersReduced: false,
    pointerFine: true,
  }))

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const read = () =>
      setMq({ prefersReduced: reduced.matches, pointerFine: fine.matches })
    read()
    reduced.addEventListener('change', read)
    fine.addEventListener('change', read)
    return () => {
      reduced.removeEventListener('change', read)
      fine.removeEventListener('change', read)
    }
  }, [])

  const max = mq.prefersReduced ? 0 : mq.pointerFine ? 7 : 3

  return (
    <TiltContext.Provider value={{ ...mq, max }}>{children}</TiltContext.Provider>
  )
}

const PERSPECTIVE = 1100

/**
 * Hook tilt ringan berbasis pointer + CSS transform.
 * Mengembalikan transform style + handlers yang ditempel ke elemen target.
 */
export function useTilt<T extends HTMLElement>(max?: number) {
  const { max: cap, pointerFine, prefersReduced } = useContext(TiltContext)
  const [t, setT] = useState({ rx: 0, ry: 0, lift: 0 })
  const limit = max ?? cap

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<T>) => {
      if (!pointerFine || prefersReduced || limit === 0) return
      const r = e.currentTarget.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      setT({ rx: (0.5 - py) * limit, ry: (px - 0.5) * limit, lift: limit * 1.1 })
    },
    [limit, pointerFine, prefersReduced],
  )

  const onPointerLeave = useCallback(() => setT({ rx: 0, ry: 0, lift: 0 }), [])

  const style =
    limit === 0
      ? undefined
      : ({
          transform: `perspective(${PERSPECTIVE}px) rotateX(${t.rx.toFixed(2)}deg) rotateY(${t.ry.toFixed(2)}deg) translateZ(${t.lift.toFixed(2)}px)`,
          transition: 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        } as const)

  return { style, onPointerMove, onPointerLeave }
}