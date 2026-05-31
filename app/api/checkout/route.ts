import { NextRequest, NextResponse } from 'next/server'
import { calculateCheckout } from '@/lib/checkout'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { bookingRef, serviceLabel, packageName, basePrice, promoCode, referralCode, clientPhone, name, phone } = body

  if (!bookingRef || !basePrice || !clientPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Re-validate and calculate server-side — never trust client price
  const breakdown = await calculateCheckout({
    basePrice:    Number(basePrice),
    promoCode:    promoCode    || undefined,
    referralCode: referralCode || undefined,
    clientPhone,
    packageName:  packageName  || undefined,
  })

  if (breakdown.errors.length > 0) {
    return NextResponse.json({ error: breakdown.errors[0], breakdown }, { status: 400 })
  }

  // Create Xendit invoice for the final calculated amount
  const auth    = Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString('base64')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://craftifyle.business'

  const xenditPayload = {
    external_id:  bookingRef,
    amount:       breakdown.final,
    description:  `Deposit — ${serviceLabel ?? 'Craftifyle Booking'} · Ref: ${bookingRef}`,
    customer: {
      given_names: name ?? 'Guest',
      ...(phone ? { mobile_number: phone } : {}),
    },
    // Pass metadata so webhook can award credits + generate referral code
    metadata: {
      clientPhone,
      bookingRef,
      promoCode:    promoCode    || null,
      referralCode: referralCode || null,
    },
    success_redirect_url: `${siteUrl}/booking/paid?ref=${bookingRef}`,
    failure_redirect_url: `${siteUrl}/booking/paid?ref=${bookingRef}&failed=1`,
    payment_methods: ['GCASH'],
    currency: 'PHP',
  }

  try {
    const res  = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(xenditPayload),
    })
    const data = await res.json()

    if (!res.ok) {
      console.error('Xendit error:', data)
      return NextResponse.json({ error: data?.message ?? 'Payment gateway error' }, { status: 500 })
    }

    return NextResponse.json({ invoiceUrl: data.invoice_url, breakdown })
  } catch (err) {
    console.error('Xendit fetch error:', err)
    return NextResponse.json({ error: 'Network error' }, { status: 500 })
  }
}
