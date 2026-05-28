'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PromoBanner from '@/components/PromoBanner'

const SUPABASE_URL = 'https://hhsehuxycouhuygaksor.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc2VodXh5Y291aHV5Z2Frc29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1ODE1MjMsImV4cCI6MjA5NTE1NzUyM30.sv-IvH1lKrr3MRMpCKwqCEKNea2Mrzk9XQdfZBz-sRY'
const BUCKET  = 'photos'
const FOLDERS = ['Single', 'Prints', 'Animated']

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

type Photo = { name: string; url: string }
type State = 'loading' | 'search' | 'empty' | 'error' | 'loaded'

const s = {
  bg: '#17120e', bg2: '#1e1710', card: '#251c13',
  border: '#2e2318', text: '#ede5d8', muted: '#9a8b7a',
  accent: '#c47a3a', navH: '68px',
}

function formatSlug(slug: string) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function GalleryPage() {
  const searchParams = useSearchParams()
  const eventSlug = searchParams.get('event') || ''

  const [state, setState]           = useState<State>('loading')
  const [allPhotos, setAllPhotos]   = useState<Record<string, Photo[]>>({})
  const [activeTab, setActiveTab]   = useState('')
  const [slugInput, setSlugInput]   = useState('')
  const [lbOpen, setLbOpen]         = useState(false)
  const [lbPhotos, setLbPhotos]     = useState<string[]>([])
  const [lbIdx, setLbIdx]           = useState(0)

  useEffect(() => {
    if (!eventSlug) { setState('search'); return }
    loadGallery(eventSlug)
  }, [eventSlug])

  useEffect(() => {
    if (!lbOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLbOpen(false)
      if (e.key === 'ArrowLeft'  && lbIdx > 0)                    setLbIdx(i => i - 1)
      if (e.key === 'ArrowRight' && lbIdx < lbPhotos.length - 1)  setLbIdx(i => i + 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lbOpen, lbIdx, lbPhotos.length])

  async function loadGallery(slug: string) {
    setState('loading')
    const result: Record<string, Photo[]> = {}

    for (const folder of FOLDERS) {
      const prefix = `${slug}/${folder}`
      const { data, error } = await sb.storage.from(BUCKET).list(prefix, { limit: 500 })
      if (error || !data) continue
      const photos = data
        .filter((f: { name: string }) => f.name && /\.(jpg|jpeg|png|gif|mp4)$/i.test(f.name))
        .map((f: { name: string }) => {
          const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(`${prefix}/${f.name}`)
          return { name: f.name, url: urlData.publicUrl }
        })
      if (photos.length > 0) result[folder] = photos
    }

    const total = Object.values(result).reduce((s, a) => s + a.length, 0)
    if (total === 0) { setState('empty'); return }

    setAllPhotos(result)
    setActiveTab(Object.keys(result)[0])
    setState('loaded')
  }

  function goToEvent() {
    const val = slugInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (val) window.location.href = `/gallery?event=${val}`
  }

  function downloadPhoto(url: string, filename: string) {
    fetch(url).then(r => r.blob()).then(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    })
  }

  function downloadAll() {
    const photos = allPhotos[activeTab] || []
    photos.forEach((p, i) => setTimeout(() => downloadPhoto(p.url, p.name), i * 300))
  }

  function openLightbox(photos: string[], idx: number) {
    setLbPhotos(photos)
    setLbIdx(idx)
    setLbOpen(true)
  }

  const currentPhotos = allPhotos[activeTab] || []
  const photoUrls = currentPhotos.filter(p => !/\.mp4$/i.test(p.name)).map(p => p.url)

  return (
    <div style={{ minHeight: '100svh', background: s.bg, color: s.text, fontFamily: 'Inter, system-ui, sans-serif' }}>

      <PromoBanner />
      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, height: s.navH, background: 'rgba(23,18,14,.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <Link href="/" style={{ fontSize: '.82rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: s.text }}>Craftifyle</Link>
        <Link href="/" style={{ fontSize: '.8rem', fontWeight: 600, color: s.muted, border: `1px solid ${s.border}`, padding: '8px 18px', borderRadius: '999px', transition: 'all .15s' }}>← Back to site</Link>
      </header>

      {/* Loading */}
      {state === 'loading' && (
        <div style={{ textAlign: 'center', padding: '96px 32px' }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${s.border}`, borderTopColor: s.accent, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ fontWeight: 800, fontSize: '1.3rem' }}>Loading your photos…</p>
          <p style={{ color: s.muted, marginTop: '8px' }}>This will just take a moment.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Search */}
      {state === 'search' && (
        <div style={{ textAlign: 'center', padding: '96px 32px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📷</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>Find your photos</h1>
          <p style={{ color: s.muted, maxWidth: '380px', margin: '0 auto 28px', lineHeight: 1.7 }}>Enter the event code from your QR card, or scan the QR code at the photobooth.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={slugInput}
              onChange={e => setSlugInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && goToEvent()}
              placeholder="e.g. abi-grad-party"
              style={{ fontFamily: 'inherit', fontSize: '.9rem', padding: '12px 18px', border: `1.5px solid ${s.border}`, borderRadius: '999px', background: s.card, color: s.text, width: '260px', outline: 'none' }}
            />
            <button onClick={goToEvent} style={{ background: s.accent, color: '#1a1208', fontFamily: 'inherit', fontSize: '.82rem', fontWeight: 700, padding: '12px 24px', borderRadius: '999px', border: 'none', cursor: 'pointer' }}>
              View Photos →
            </button>
          </div>
        </div>
      )}

      {/* Empty */}
      {state === 'empty' && (
        <div style={{ textAlign: 'center', padding: '96px 32px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⏳</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>Photos are on their way</h1>
          <p style={{ color: s.muted, maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.7 }}>Photos will appear here as they&rsquo;re taken. Scan the QR code again in a few minutes.</p>
          <button onClick={() => window.location.href = '/gallery'} style={{ background: 'transparent', color: s.accent, fontFamily: 'inherit', fontSize: '.82rem', fontWeight: 600, padding: '10px 20px', borderRadius: '999px', border: `1px solid ${s.accent}`, cursor: 'pointer' }}>
            Try another event →
          </button>
        </div>
      )}

      {/* Loaded */}
      {state === 'loaded' && (
        <>
          {/* Hero */}
          <div style={{ textAlign: 'center', padding: '64px 32px 40px', borderBottom: `1px solid ${s.border}` }}>
            <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: s.accent, marginBottom: '12px' }}>Craftifyle Photobooth</p>
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-.03em', marginBottom: '12px' }}>{formatSlug(eventSlug)}</h1>
            <p style={{ color: s.muted, fontSize: '.9rem' }}>Tap any photo to view full size — then download it to your device.</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '28px 32px 0', flexWrap: 'wrap' }}>
            {Object.keys(allPhotos).map(folder => (
              <button key={folder} onClick={() => setActiveTab(folder)}
                style={{ background: activeTab === folder ? s.accent : 'rgba(255,255,255,.05)', border: `1px solid ${activeTab === folder ? s.accent : s.border}`, color: activeTab === folder ? '#fff' : s.muted, fontSize: '.72rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', padding: '8px 22px', borderRadius: '999px', cursor: 'pointer', transition: 'all .15s' }}>
                {folder} ({allPhotos[folder].length})
              </button>
            ))}
          </div>

          {/* Download all */}
          <div style={{ textAlign: 'center', padding: '20px 24px 8px' }}>
            <button onClick={downloadAll}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: s.accent, color: '#1a1208', fontSize: '.82rem', fontWeight: 700, padding: '13px 28px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              ⬇ Download All Photos
            </button>
          </div>

          {/* Grid */}
          <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 24px 80px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {currentPhotos.map((photo, i) => {
                const isVideo = /\.mp4$/i.test(photo.name)
                const imgIdx  = photoUrls.indexOf(photo.url)
                return (
                  <div key={photo.name} style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: '16px', overflow: 'hidden', transition: 'transform .2s, box-shadow .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,.5)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
                    {isVideo ? (
                      <video src={photo.url} autoPlay loop muted playsInline style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <img src={photo.url} alt={photo.name} loading="lazy"
                        onClick={() => openLightbox(photoUrls, imgIdx)}
                        style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }} />
                    )}
                    <div style={{ padding: '12px', borderTop: `1px solid ${s.border}` }}>
                      <button onClick={() => downloadPhoto(photo.url, photo.name)}
                        style={{ width: '100%', background: 'rgba(196,122,58,.12)', border: '1px solid rgba(196,122,58,.3)', color: s.accent, fontSize: '.76rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '9px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,122,58,.22)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(196,122,58,.12)')}>
                        Download
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Lightbox */}
      {lbOpen && (
        <div onClick={() => setLbOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.93)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <button onClick={() => setLbOpen(false)}
            style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', opacity: .65, lineHeight: 1 }}>×</button>
          <button onClick={e => { e.stopPropagation(); setLbIdx(i => i - 1) }} disabled={lbIdx === 0}
            style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.12)', border: 'none', color: '#fff', width: 48, height: 48, borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: lbIdx === 0 ? .2 : 1 }}>←</button>
          <img src={lbPhotos[lbIdx]} alt="" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '6px', display: 'block' }} />
          <button onClick={e => { e.stopPropagation(); setLbIdx(i => i + 1) }} disabled={lbIdx === lbPhotos.length - 1}
            style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.12)', border: 'none', color: '#fff', width: 48, height: 48, borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: lbIdx === lbPhotos.length - 1 ? .2 : 1 }}>→</button>
          <span style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,.5)', fontSize: '.72rem', fontWeight: 600, letterSpacing: '.08em' }}>
            {lbIdx + 1} / {lbPhotos.length}
          </span>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${s.border}`, padding: '24px 32px', textAlign: 'center', fontSize: '.78rem', color: s.muted }}>
        © 2026 Craftifyle — Zamboanga City, Philippines
      </footer>
    </div>
  )
}

export default function GalleryPageWrapper() {
  return <Suspense><GalleryPage /></Suspense>
}
