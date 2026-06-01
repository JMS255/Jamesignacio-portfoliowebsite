import { NextRequest, NextResponse } from 'next/server'
import { savePendingBooking } from '@/lib/checkout'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { bookingRef, clientPhone, clientName, packageName, referralCode, promoCode } = body
  if (!bookingRef || !clientPhone) {
    return NextResponse.json({ error: 'Missing bookingRef or clientPhone' }, { status: 400 })
  }

  await savePendingBooking({ bookingRef, clientPhone, clientName, packageName, referralCode, promoCode })
  return NextResponse.json({ ok: true })
}
