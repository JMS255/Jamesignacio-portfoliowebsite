import { NextResponse } from 'next/server'

const GCAL_API_KEY     = 'AIzaSyBXSHn11u1ZYYkm1k7RgnRtPUfD0c70SXw'
const GCAL_CALENDAR_ID = 'craftifylephotobooth@gmail.com'

function pad(n: number) { return String(n).padStart(2, '0') }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year  = parseInt(searchParams.get('year')  ?? '')
  const month = parseInt(searchParams.get('month') ?? '')

  if (isNaN(year) || isNaN(month)) {
    return NextResponse.json({ dates: [] })
  }

  const timeMin = new Date(year, month, 1).toISOString()
  const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

  try {
    // Try FreeBusy first (works regardless of event creator)
    const fbRes = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy?key=${GCAL_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeMin,
          timeMax,
          timeZone: 'Asia/Manila',
          items: [{ id: GCAL_CALENDAR_ID }],
        }),
      }
    )

    if (fbRes.ok) {
      const fbData = await fbRes.json()
      const busy: { start: string; end: string }[] =
        fbData.calendars?.[GCAL_CALENDAR_ID]?.busy ?? []

      if (busy.length > 0 || !fbData.calendars?.[GCAL_CALENDAR_ID]?.errors) {
        const dates = new Set<string>()
        busy.forEach(({ start, end }) => {
          const cur = new Date(start)
          cur.setHours(0, 0, 0, 0)
          const stop = new Date(end)
          stop.setHours(0, 0, 0, 0)
          while (cur <= stop) {
            dates.add(`${cur.getFullYear()}-${pad(cur.getMonth()+1)}-${pad(cur.getDate())}`)
            cur.setDate(cur.getDate() + 1)
          }
        })
        return NextResponse.json({ dates: [...dates] })
      }
    }

    // Fallback: Events API (catches manually created events)
    const calId = encodeURIComponent(GCAL_CALENDAR_ID)
    const evRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?key=${GCAL_API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`
    )

    if (!evRes.ok) return NextResponse.json({ dates: [] })
    const evData = await evRes.json()
    const dates = new Set<string>()

    ;(evData.items ?? []).forEach((ev: { start: { date?: string; dateTime?: string }; end: { date?: string; dateTime?: string } }) => {
      const startStr = ev.start.date || (ev.start.dateTime || '').split('T')[0]
      const endStr   = ev.end.date   || (ev.end.dateTime   || '').split('T')[0]
      if (!startStr) return
      const cur = new Date(startStr + 'T00:00:00')
      const stop = new Date((endStr || startStr) + 'T00:00:00')
      while (cur < stop) {
        dates.add(`${cur.getFullYear()}-${pad(cur.getMonth()+1)}-${pad(cur.getDate())}`)
        cur.setDate(cur.getDate() + 1)
      }
    })

    return NextResponse.json({ dates: [...dates] })
  } catch {
    return NextResponse.json({ dates: [] })
  }
}
