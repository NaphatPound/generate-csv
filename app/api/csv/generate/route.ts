import { NextRequest, NextResponse } from 'next/server'
import { resolveTemplate, resolveData } from '@/lib/resolveData'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { templateId, filters } = await request.json()

    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
    }

    const template = await resolveTemplate(templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const fieldPaths = template.fields.map((f) => f.fieldPath)
    const data = await resolveData(template.mainTable, fieldPaths, filters)

    const headers = template.fields.map((f) => f.columnName)
    const rows = data.map((row: any) =>
      template.fields.map((f) => {
        const val = row[f.fieldPath]
        return val !== null && val !== undefined ? String(val) : ''
      })
    )

    const csvContent = [
      headers.map(escapeCsvField).join(','),
      ...rows.map((row) => row.map(escapeCsvField).join(',')),
    ].join('\r\n')

    const BOM = '\uFEFF'
    const csvBuffer = Buffer.from(BOM + csvContent, 'utf-8')

    return new NextResponse(csvBuffer, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${template.name.replace(/[^\x20-\x7E]/g, '_')}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error generating CSV:', error)
    return NextResponse.json({ error: 'Failed to generate CSV' }, { status: 500 })
  }
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
