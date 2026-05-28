'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const GCAL_API_KEY     = 'AIzaSyBXSHn11u1ZYYkm1k7RgnRtPUfD0c70SXw'
const GCAL_CALENDAR_ID = 'craftifylephotobooth@gmail.com'
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function pad(n: number) { return String(n).padStart(2, '0') }

export default function Availability() {
  const router = useRouter()
  const today = new Date(); today.setHours(0,0,0,0)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [bookedDates, setBookedDates] = useState(new Set<string>())
  const [fetchedMonths] = useState(new Set<string>())

  const fetchBooked = useCallback(async (year: number, month: number) => {
    const key = `${year}-${month}`
    if (fetchedMonths.has(key)) return
    fetchedMonths.add(key)
    const timeMin = new Date(year, month, 1).toISOString()
    const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
    const calId   = encodeURIComponent(GCAL_CALENDAR_ID)
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?key=${GCAL_API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`
    try {
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      const newDates: string[] = []
      ;(data.items || []).forEach((ev: { start: { date?: string; dateTime?: string }; end: { date?: string; dateTime?: string } }) => {
        const startStr = ev.start.date || (ev.start.dateTime || '').split('T')[0]
        const endStr   = ev.end.date   || (ev.end.dateTime   || '').split('T')[0]
        if (!startStr) return
        let cur = new Date(startStr + 'T00:00:00')
        const stop = new Date((endStr || startStr) + 'T00:00:00')
        while (cur < stop) {
          newDates.push(`${cur.getFullYear()}-${pad(cur.getMonth()+1)}-${pad(cur.getDate())}`)
          cur.setDate(cur.getDate() + 1)
        }
      })
      if (newDates.length > 0) {
        setBookedDates(prev => {
          const next = new Set(prev)
          newDates.forEach(d => next.add(d))
          return next
        })
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchBooked(viewYear, viewMonth) }, [viewYear, viewMonth, fetchBooked])

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate()
  const isPrevDisabled = viewYear === today.getFullYear() && viewMonth <= today.getMonth()

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  return (
    <section className="booking section section--alt" id="booking">
      <div className="container">
        <p className="section__label">Availability</p>
        <h2 className="section__title">Check my schedule.</h2>
        <p className="section__sub">Pick an open date to start a booking inquiry. Booked dates are already taken — click any available date to get started.</p>

        <div className="cal-wrapper">
          <div className="cal-header">
            <button className="cal-nav" onClick={prevMonth} disabled={isPrevDisabled} aria-label="Previous month">←</button>
            <span className="cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
            <button className="cal-nav" onClick={nextMonth} aria-label="Next month">→</button>
          </div>
          <div className="cal-days-header" aria-hidden="true">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="cal-grid" role="grid" aria-label="Availability calendar">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`e${i}`} className="cal-day cal-day--empty" aria-hidden="true" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const d = idx + 1
              const dateStr = `${viewYear}-${pad(viewMonth+1)}-${pad(d)}`
              const isPast   = dateStr < todayStr
              const isToday  = dateStr === todayStr
              const isBooked = bookedDates.has(dateStr)
              const formattedDate = `${MONTHS[viewMonth]} ${d}, ${viewYear}`

              if (isPast) return (
                <div key={d} className="cal-day cal-day--past" aria-label={`${MONTHS[viewMonth]} ${d} — past`} aria-disabled="true">
                  <span className="cal-day__num">{d}</span>
                </div>
              )
              if (isBooked) return (
                <div key={d} className="cal-day cal-day--booked" aria-label={`${MONTHS[viewMonth]} ${d} — booked`} aria-disabled="true">
                  <span className="cal-day__num">{d}</span>
                  <span className="cal-day__tag">Booked</span>
                </div>
              )
              return (
                <div
                  key={d}
                  className={`cal-day cal-day--available${isToday ? ' cal-day--today' : ''}`}
                  tabIndex={0}
                  role="gridcell"
                  aria-label={`${MONTHS[viewMonth]} ${d} — available, click to book`}
                  onClick={() => router.push('/booking?date=' + encodeURIComponent(formattedDate))}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      router.push('/booking?date=' + encodeURIComponent(formattedDate))
                    }
                  }}
                >
                  <span className="cal-day__num">{d}</span>
                </div>
              )
            })}
          </div>
          <div className="cal-legend" aria-hidden="true">
            <span className="cal-legend__item cal-legend__item--available">Available — click to book</span>
            <span className="cal-legend__item cal-legend__item--booked">Booked</span>
            <span className="cal-legend__item cal-legend__item--past">Past</span>
          </div>
        </div>
      </div>
    </section>
  )
}
