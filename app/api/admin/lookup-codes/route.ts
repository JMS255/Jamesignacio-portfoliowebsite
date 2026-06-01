import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDb() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(url, key)
}

function phoneVariants(raw: string): string[] {
  const p = raw.replace(/[\s\-().]/g, '')
  const variants = new Set<string>([p])
  if (p.startsWith('+63'))                        { variants.add('0' + p.slice(3)) }
  else if (p.startsWith('63') && p.length === 12) { variants.add('+' + p); variants.add('0' + p.slice(2)) }
  else if (p.startsWith('0')  && p.length === 11) { variants.add('+63' + p.slice(1)) }
  return Array.from(variants)
}

interface PromoRow    { code: string; amount: number; expires_at: string | null; active: boolean; used_count: number }
interface ReferralRow { code: string; active: boolean; booking_ref: string }

export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET
  const auth   = req.headers.get('authorization') ?? ''
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const phone = req.nextUrl.searchParams.get('phone')?.trim()
  if (!phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 })

  const db       = getDb()
  const variants = phoneVariants(phone)

  const { data: promos } = await db
    .from('promo_codes')
    .select('code, amount, expires_at, active, used_count')
    .in('owner_phone', variants)
    .order('created_at', { ascending: false })
    .returns<PromoRow[]>()

  const { data: referrals } = await db
    .from('referral_codes')
    .select('code, active, booking_ref')
    .in('referrer_phone', variants)
    .order('created_at', { ascending: false })
    .returns<ReferralRow[]>()

  return NextResponse.json({ promos: promos ?? [], referrals: referrals ?? [] })
}
