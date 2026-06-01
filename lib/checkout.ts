import { createClient } from '@supabase/supabase-js'

const REFERRAL_DISCOUNT_BUNDLE  = 500
const REFERRAL_DISCOUNT_SINGLE  = 200

function getReferralDiscount(packageName?: string): number {
  return packageName?.toLowerCase().includes('bundle')
    ? REFERRAL_DISCOUNT_BUNDLE
    : REFERRAL_DISCOUNT_SINGLE
}
const MIN_XENDIT_AMOUNT = 500   // floor — absolute minimum charge

const VOUCHER_AMOUNTS: Record<string, number> = {
  'Photobooth Service':                  200,
  'Event Photography':                   300,
  'Photobooth + Photography Bundle':     500,
}
const VOUCHER_DEFAULT = 200

// Use service role key for all server-side DB operations
function getDb() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(url, key)
}

export interface CheckoutInput {
  basePrice:    number
  promoCode?:   string
  referralCode?: string
  clientPhone:  string
  packageName?: string   // e.g. "Photobooth + Photography Bundle"
}

export interface CheckoutBreakdown {
  base:             number
  promoDiscount:    number
  afterPromo:       number
  referralDiscount: number
  final:            number
  errors:           string[]
}

interface PromoRow {
  type: 'flat' | 'percent'
  amount: number
  expires_at: string | null
  max_uses: number | null
  used_count: number
  active: boolean
  applies_to: string[] | null
}

interface ReferralRow {
  referrer_phone: string
  active: boolean
}

export async function calculateCheckout(input: CheckoutInput): Promise<CheckoutBreakdown> {
  const db = getDb()
  const errors: string[] = []
  let price = input.basePrice
  let promoDiscount    = 0
  let referralDiscount = 0

  // ── Step 2: Promo code ──────────────────────────────────────────────────────
  if (input.promoCode) {
    const { data: promo } = await db
      .from('promo_codes')
      .select('type, amount, expires_at, max_uses, used_count, active, applies_to')
      .eq('code', input.promoCode.toUpperCase())
      .single<PromoRow>()

    if (!promo) {
      errors.push('Promo code not found.')
    } else if (!promo.active) {
      errors.push('Promo code is no longer active.')
    } else if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      errors.push('Promo code has expired.')
    } else if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
      errors.push('Promo code has reached its usage limit.')
    } else if (promo.applies_to && promo.applies_to.length > 0 && input.packageName && !promo.applies_to.includes(input.packageName)) {
      errors.push(`This code is only valid for: ${promo.applies_to.join(', ')}.`)
    } else {
      if (promo.type === 'flat') {
        promoDiscount = Math.min(promo.amount, price)
      } else {
        promoDiscount = Math.round((promo.amount / 100) * price)
      }
      price -= promoDiscount
    }
  }

  const afterPromo = price

  // ── Step 3: Referral code OR in-store credit ────────────────────────────────
  if (input.referralCode) {
    const { data: referral } = await db
      .from('referral_codes')
      .select('referrer_phone, active')
      .eq('code', input.referralCode.toUpperCase())
      .single<ReferralRow>()

    if (!referral) {
      errors.push('Referral code not found.')
    } else if (!referral.active) {
      errors.push('Referral code is no longer active.')
    } else if (referral.referrer_phone === input.clientPhone) {
      errors.push('You cannot use your own referral code.')
    } else {
      // Check if already used by this client
      const { data: existing } = await db
        .from('referral_uses')
        .select('id')
        .eq('referral_code', input.referralCode.toUpperCase())
        .eq('client_phone', input.clientPhone)
        .maybeSingle()

      if (existing) {
        errors.push('You have already used this referral code.')
      } else {
        referralDiscount = getReferralDiscount(input.packageName)
        price -= referralDiscount
      }
    }
  }

  const final = Math.max(price, MIN_XENDIT_AMOUNT)

  return { base: input.basePrice, promoDiscount, afterPromo, referralDiscount, final, errors }
}

// ── DB write helpers (called after GCash deposit confirmed) ───────────────────

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function recordPromoUse(code: string) {
  const db = getDb()
  await db.rpc('increment_promo_used_count', { p_code: code.toUpperCase() })
}

export async function recordReferralUse(referralCode: string, clientPhone: string, bookingRef: string) {
  const db = getDb()
  await db.from('referral_uses').insert({
    referral_code: referralCode.toUpperCase(),
    client_phone:  clientPhone,
    booking_ref:   bookingRef,
  })
}

export async function awardReferrerVoucher(
  referrerPhone: string,
  bookingRef: string,
  packageName?: string,
) {
  const db     = getDb()
  const amount = VOUCHER_AMOUNTS[packageName ?? ''] ?? VOUCHER_DEFAULT
  const code   = `VCH-${generateReferralCode()}`
  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 6)
  await db.from('promo_codes').insert({
    code,
    type:        'flat',
    amount,
    expires_at:  expiresAt.toISOString(),
    max_uses:    1,
    used_count:  0,
    active:      true,
    owner_phone: referrerPhone,
    applies_to:  null,
  })
  return { code, amount, expiresAt }
}

export async function generatePersonalPromoCode(
  clientPhone: string,
  amount: number,
  label?: string,
) {
  const db   = getDb()
  const code = label
    ? `WELCOMEBACK-${label.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)}-${generateReferralCode().slice(0, 4)}`
    : `PROMO-${generateReferralCode()}`
  await db.from('promo_codes').insert({
    code,
    type:        'flat',
    amount,
    expires_at:  null,
    max_uses:    1,
    used_count:  0,
    active:      true,
    owner_phone: clientPhone,
    applies_to:  null,
  })
  return code
}

export async function savePendingBooking(data: {
  bookingRef:    string
  clientPhone:   string
  clientName?:   string
  packageName?:  string
  referralCode?: string
  promoCode?:    string
}) {
  const db = getDb()
  await db.from('pending_bookings').upsert({
    booking_ref:   data.bookingRef,
    client_phone:  data.clientPhone,
    client_name:   data.clientName   ?? null,
    package_name:  data.packageName  ?? null,
    referral_code: data.referralCode ?? null,
    promo_code:    data.promoCode    ?? null,
  })
}
