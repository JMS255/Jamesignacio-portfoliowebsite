import { createClient } from '@supabase/supabase-js'

const REFERRAL_DISCOUNT   = 200   // ₱ off for new client using a referral code
const MAX_CREDIT_DISCOUNT = 200   // max ₱ of in-store credit per booking
const MIN_XENDIT_AMOUNT   = 500   // floor — absolute minimum sent to Xendit

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
  creditDiscount:   number
  creditUsed:       number
  final:            number   // max(result, MIN_XENDIT_AMOUNT)
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

interface CreditRow {
  balance: number
}

export async function calculateCheckout(input: CheckoutInput): Promise<CheckoutBreakdown> {
  const db = getDb()
  const errors: string[] = []
  let price = input.basePrice
  let promoDiscount    = 0
  let referralDiscount = 0
  let creditDiscount   = 0
  let creditUsed       = 0

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
        referralDiscount = REFERRAL_DISCOUNT
        price -= referralDiscount
      }
    }
  } else {
    // No referral code — check for in-store credits
    const { data: credit } = await db
      .from('store_credits')
      .select('balance')
      .eq('phone', input.clientPhone)
      .single<CreditRow>()

    if (credit && credit.balance > 0) {
      creditUsed    = Math.min(credit.balance, MAX_CREDIT_DISCOUNT)
      creditDiscount = creditUsed
      price -= creditDiscount
    }
  }

  // ── Step 4: Floor ────────────────────────────────────────────────────────────
  const final = Math.max(price, MIN_XENDIT_AMOUNT)

  return { base: input.basePrice, promoDiscount, afterPromo, referralDiscount, creditDiscount, creditUsed, final, errors }
}

// ── DB write helpers (called only after Xendit payment confirmed) ──────────────

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

export async function spendCredits(phone: string, amount: number, bookingRef: string) {
  const db = getDb()
  // Deduct balance
  await db.rpc('deduct_store_credit', { p_phone: phone, p_amount: amount })
  // Audit trail
  await db.from('credit_transactions').insert({
    phone, amount: -amount, reason: 'booking_discount', booking_ref: bookingRef,
  })
}

export async function awardReferrerCredit(referrerPhone: string, bookingRef: string) {
  const db = getDb()
  // Upsert: add ₱200 to referrer's balance
  await db.rpc('add_store_credit', { p_phone: referrerPhone, p_amount: REFERRAL_DISCOUNT })
  // Audit trail
  await db.from('credit_transactions').insert({
    phone: referrerPhone, amount: REFERRAL_DISCOUNT, reason: 'referral_reward', booking_ref: bookingRef,
  })
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
