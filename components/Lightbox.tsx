'use client'

import { useEffect } from 'react'

interface Props {
  images: string[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function Lightbox({ images, index, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && index > 0) onPrev()
      if (e.key === 'ArrowRight' && index < images.length - 1) onNext()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [index, images.length, onClose, onPrev, onNext])

  return (
    <div className="lightbox is-open" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose}>
      <button className="lightbox__close" aria-label="Close" onClick={onClose}>&times;</button>
      <button
        className="lightbox__nav lightbox__nav--prev"
        aria-label="Previous image"
        disabled={index === 0}
        onClick={e => { e.stopPropagation(); onPrev() }}
      >
        ←
      </button>
      <img
        className="lightbox__img"
        src={images[index]}
        alt=""
        onClick={e => e.stopPropagation()}
      />
      <button
        className="lightbox__nav lightbox__nav--next"
        aria-label="Next image"
        disabled={index === images.length - 1}
        onClick={e => { e.stopPropagation(); onNext() }}
      >
        →
      </button>
      <span className="lightbox__counter" aria-live="polite">{index + 1} / {images.length}</span>
    </div>
  )
}
