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
    const data = await resolveData(template.mainTable, fieldPaths, filters, 10)

    const headers = template.fields.map((f) => f.columnName)
    const rows = data.map((row: any) =>
      template.fields.map((f) => {
        const val = row[f.fieldPath]
        return val !== null && val !== undefined ? String(val) : ''
      })
    )

    return NextResponse.json({
      total: data.length,
      headers,
      rows,
      template: {
        id: template.id,
        name: template.name,
        mainTable: template.mainTable,
        fieldCount: template.fields.length,
      },
    })
  } catch (error) {
    console.error('Error previewing CSV:', error)
    return NextResponse.json({ error: 'Failed to preview CSV' }, { status: 500 })
  }
}
