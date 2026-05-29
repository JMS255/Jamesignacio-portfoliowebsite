import { NextResponse } from 'next/server'

const SUPABASE_URL = 'https://hhsehuxycouhuygaksor.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc2VodXh5Y291aHV5Z2Frc29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1ODE1MjMsImV4cCI6MjA5NTE1NzUyM30.sv-IvH1lKrr3MRMpCKwqCEKNea2Mrzk9XQdfZBz-sRY'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year  = parseInt(searchParams.get('year')  ?? '')
  const month = parseInt(searchParams.get('month') ?? '')

  if (isNaN(year) || isNaN(month)) {
    return NextResponse.json({ dates: [] })
  }

  const fromDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay  = new Date(year, month + 1, 0).getDate()
  const toDate   = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/get_booked_dates`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ from_date: fromDate, to_date: toDate }),
      }
    )

    if (!res.ok) return NextResponse.json({ dates: [] })
    const data: string[] = await res.json()
    return NextResponse.json({ dates: data ?? [] })
  } catch {
    return NextResponse.json({ dates: [] })
  }
}
