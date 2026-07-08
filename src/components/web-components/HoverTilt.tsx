'use client'
import React, { useRef, useEffect } from 'react'

type HoverTiltProps = React.HTMLAttributes<HTMLElement> & {
  shadow?: boolean
  'shadow-blur'?: number
  'scale-factor'?: number
  'glare-intensity'?: number
  'glare-mask'?: string
  'glare-mask-mode'?: string
  'blend-mode'?: string
  class?: string
}

export const HoverTilt: React.FC<HoverTiltProps> = ({ children, ...props }) => {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      if (value === false) {
        element.removeAttribute(key)
      } else if (value === true) {
        element.setAttribute(key, '')
      } else {
        element.setAttribute(key, String(value))
      }
    })
  }, [props])

  return React.createElement('hover-tilt', { ref, class: props.class }, children)
}