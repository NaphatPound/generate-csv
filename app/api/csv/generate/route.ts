import { NextRequest, NextResponse } from 'next/server'
import { resolveTemplate, resolveData } from '@/lib/resolveData'

export const dynamic = 'force-dynamic'

async function generateCsvData(templateId: string, filters?: Record<string, string>) {
  const template = await resolveTemplate(templateId)
  if (!template) return null

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

  return { template, headers, rows, csvContent }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    const format = searchParams.get('format')

    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required (query param)' }, { status: 400 })
    }

    const filters: Record<string, string> = {}
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'templateId' && key !== 'format' && value) {
        filters[key] = value
      }
    }

    const result = await generateCsvData(templateId, Object.keys(filters).length > 0 ? filters : undefined)
    if (!result) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (format === 'json') {
      return NextResponse.json({
        template: { id: result.template.id, name: result.template.name },
        headers: result.headers,
        rows: result.rows,
        total: result.rows.length,
        csv: result.csvContent,
      })
    }

    const BOM = '\uFEFF'
    const csvBuffer = Buffer.from(BOM + result.csvContent, 'utf-8')
    return new NextResponse(csvBuffer, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${result.template.name.replace(/[^\x20-\x7E]/g, '_')}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error generating CSV:', error)
    return NextResponse.json({ error: 'Failed to generate CSV' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, filters } = await request.json()

    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
    }

    const result = await generateCsvData(templateId, filters)
    if (!result) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const BOM = '\uFEFF'
    const csvBuffer = Buffer.from(BOM + result.csvContent, 'utf-8')
    return new NextResponse(csvBuffer, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${result.template.name.replace(/[^\x20-\x7E]/g, '_')}.csv"`,
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
