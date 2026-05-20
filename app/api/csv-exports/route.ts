import { NextResponse } from 'next/server'
import { getExports } from '@/lib/exportStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const records = await getExports()
    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching exports:', error)
    return NextResponse.json({ error: 'Failed to fetch exports' }, { status: 500 })
  }
}
