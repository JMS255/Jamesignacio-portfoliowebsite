import { NextRequest, NextResponse } from 'next/server'
import { calculateCheckout } from '@/lib/checkout'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { promoCode, referralCode, clientPhone, basePrice } = body
  if (!clientPhone || !basePrice) {
    return NextResponse.json({ error: 'Missing clientPhone or basePrice' }, { status: 400 })
  }

  const breakdown = await calculateCheckout({
    basePrice: Number(basePrice),
    promoCode:    promoCode    || undefined,
    referralCode: referralCode || undefined,
    clientPhone,
  })

  return NextResponse.json({ breakdown })
}
