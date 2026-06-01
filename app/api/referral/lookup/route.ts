import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDb() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(url, key)
}

interface ReferralCodeRow { code: string }
interface VoucherRow { code: string; amount: number; expires_at: string | null }

function phoneVariants(raw: string): string[] {
  const p = raw.replace(/[\s\-().]/g, '')
  const variants = new Set<string>([p])
  if (p.startsWith('+63'))                       { variants.add('0' + p.slice(3)) }
  else if (p.startsWith('63') && p.length === 12){ variants.add('+' + p); variants.add('0' + p.slice(2)) }
  else if (p.startsWith('0')  && p.length === 11){ variants.add('+63' + p.slice(1)) }
  return Array.from(variants)
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('phone')?.trim()
  if (!raw) return NextResponse.json({ error: 'Missing phone' }, { status: 400 })

  const db       = getDb()
  const variants = phoneVariants(raw)

  const { data: refRow } = await db
    .from('referral_codes')
    .select('code')
    .in('referrer_phone', variants)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<ReferralCodeRow>()

  const now = new Date().toISOString()
  const { data: vouchers } = await db
    .from('promo_codes')
    .select('code, amount, expires_at')
    .in('owner_phone', variants)
    .eq('active', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .returns<VoucherRow[]>()

  return NextResponse.json({
    referralCode: refRow?.code ?? null,
    vouchers:     vouchers ?? [],
  })
}
