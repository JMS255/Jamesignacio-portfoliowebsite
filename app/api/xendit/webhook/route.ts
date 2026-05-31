import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const token    = req.headers.get('x-callback-token')
  const expected = process.env.XENDIT_WEBHOOK_TOKEN
  if (expected && token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  if (body.status === 'PAID' || body.status === 'SETTLED') {
    console.log(`[Xendit] Payment confirmed — ref: ${body.external_id}, amount: ₱${body.amount}`)
  }

  return NextResponse.json({ received: true })
}
