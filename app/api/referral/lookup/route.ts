import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDb() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(url, key)
}

interface ReferralCodeRow { code: string }
interface VoucherRow { code: string; amount: number; expires_at: string | null }

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')?.trim()
  if (!phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 })

  const db = getDb()

  const { data: refRow } = await db
    .from('referral_codes')
    .select('code')
    .eq('referrer_phone', phone)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<ReferralCodeRow>()

  const now = new Date().toISOString()
  const { data: vouchers } = await db
    .from('promo_codes')
    .select('code, amount, expires_at')
    .eq('owner_phone', phone)
    .eq('active', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .returns<VoucherRow[]>()

  return NextResponse.json({
    referralCode: refRow?.code ?? null,
    vouchers:     vouchers ?? [],
  })
}
