import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  awardReferrerVoucher,
  recordPromoUse,
  recordReferralUse,
  generateReferralCode,
  generatePersonalPromoCode,
} from '@/lib/checkout'

function getDb() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(url, key)
}

interface PendingBooking {
  booking_ref:   string
  client_phone:  string
  client_name:   string | null
  package_name:  string | null
  referral_code: string | null
  promo_code:    string | null
  confirmed:     boolean
}

export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET
  const auth   = req.headers.get('authorization') ?? ''
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.bookingRef) {
    return NextResponse.json({ error: 'Missing bookingRef' }, { status: 400 })
  }

  const db = getDb()

  const { data: booking } = await db
    .from('pending_bookings')
    .select('*')
    .eq('booking_ref', body.bookingRef)
    .single<PendingBooking>()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.confirmed) return NextResponse.json({ error: 'Already confirmed' }, { status: 409 })

  const { client_phone, client_name, package_name, referral_code, promo_code } = booking
  let voucherResult: { code: string; amount: number; expiresAt: Date } | null = null

  // 1. Record promo usage
  if (promo_code) {
    try { await recordPromoUse(promo_code) } catch (e) { console.error('recordPromoUse:', e) }
  }

  // 2. Record referral use + award voucher to referrer
  if (referral_code) {
    try {
      await recordReferralUse(referral_code, client_phone, body.bookingRef)
      const { data: ref } = await db
        .from('referral_codes')
        .select('referrer_phone')
        .eq('code', referral_code.toUpperCase())
        .single<{ referrer_phone: string }>()

      if (ref?.referrer_phone) {
        voucherResult = await awardReferrerVoucher(ref.referrer_phone, body.bookingRef, package_name ?? undefined)
      }
    } catch (e) { console.error('referral award:', e) }
  }

  // 3. Generate sharable referral code for this client
  const newCode = generateReferralCode()
  try {
    await db.from('referral_codes').insert({
      code:           newCode,
      referrer_phone: client_phone,
      referrer_name:  client_name ?? '',
      booking_ref:    body.bookingRef,
      active:         true,
    })
  } catch (e) { console.error('insert referral_codes:', e) }

  // 4. Generate ₱200 personal promo code for the new client
  let personalPromoCode: string | null = null
  try {
    personalPromoCode = await generatePersonalPromoCode(client_phone, 200)
  } catch (e) { console.error('generatePersonalPromoCode:', e) }

  // 5. Mark confirmed
  await db.from('pending_bookings').update({ confirmed: true }).eq('booking_ref', body.bookingRef)

  return NextResponse.json({
    ok:                 true,
    clientReferralCode: newCode,
    personalPromoCode,
    voucherCode:        voucherResult?.code     ?? null,
    voucherAmount:      voucherResult?.amount    ?? null,
    voucherExpiry:      voucherResult?.expiresAt ?? null,
  })
}
