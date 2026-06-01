import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  awardReferrerVoucher,
  recordPromoUse,
  recordReferralUse,
  generateReferralCode,
} from '@/lib/checkout'

function getDb() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const token    = req.headers.get('x-callback-token')
  const expected = process.env.XENDIT_WEBHOOK_TOKEN
  if (expected && token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  if (body.status !== 'PAID' && body.status !== 'SETTLED') {
    return NextResponse.json({ received: true })
  }

  const bookingRef   = body.external_id as string
  const meta         = body.metadata as Record<string, string | null> | undefined
  const clientPhone  = meta?.clientPhone  ?? null
  const promoCode    = meta?.promoCode    ?? null
  const referralCode = meta?.referralCode ?? null

  console.log(`[Xendit] Payment confirmed — ref: ${bookingRef}, amount: ₱${body.amount}`)

  // ── 1. Record promo usage ────────────────────────────────────────────────
  if (promoCode) {
    try { await recordPromoUse(promoCode) } catch (e) { console.error('recordPromoUse error:', e) }
  }

  // ── 2. Record referral usage + deduct credit if used ────────────────────
  if (referralCode && clientPhone) {
    try {
      await recordReferralUse(referralCode, clientPhone, bookingRef)
    } catch (e) { console.error('recordReferralUse error:', e) }

    // Award ₱200 credit to referrer
    try {
      const db = getDb()
      const { data: ref } = await db
        .from('referral_codes')
        .select('referrer_phone')
        .eq('code', referralCode.toUpperCase())
        .single<{ referrer_phone: string }>()

      if (ref?.referrer_phone) {
        await awardReferrerVoucher(ref.referrer_phone, bookingRef)
      }
    } catch (e) { console.error('awardReferrerVoucher error:', e) }
  }

  // ── 3. Generate referral code for this new client ────────────────────────
  if (clientPhone) {
    try {
      const db   = getDb()
      const code = generateReferralCode()
      // Grab client name from invoice if available
      const name = (body.customer?.given_names as string) ?? ''
      await db.from('referral_codes').insert({
        code,
        referrer_phone: clientPhone,
        referrer_name:  name,
        booking_ref:    bookingRef,
        active:         true,
      })
      console.log(`[Referral] Generated code ${code} for ${clientPhone}`)
    } catch (e) { console.error('generateReferralCode error:', e) }
  }

  return NextResponse.json({ received: true })
}
