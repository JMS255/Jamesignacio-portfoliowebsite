import { NextRequest, NextResponse } from 'next/server'
import { generatePersonalPromoCode } from '@/lib/checkout'

export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET
  const auth   = req.headers.get('authorization') ?? ''
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.clientName) {
    return NextResponse.json({ error: 'Missing clientName' }, { status: 400 })
  }

  try {
    const firstName = body.clientName.trim().split(' ')[0]
    const code = await generatePersonalPromoCode(body.clientPhone?.trim() || 'NOPHONE', 500, firstName)
    return NextResponse.json({ ok: true, code })
  } catch (e) {
    console.error('generate-welcome-code:', e)
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
  }
}
