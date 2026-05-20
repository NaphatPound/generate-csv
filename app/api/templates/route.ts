import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTemplates, addTemplate } from '@/lib/mockStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const templates = await prisma.csvTemplate.findMany({
      include: { fields: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(templates)
  } catch {
    return NextResponse.json(getTemplates())
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, description, mainTable, fields } = body

  if (!name || !mainTable || !fields?.length) {
    return NextResponse.json(
      { error: 'Name, mainTable, and at least one field are required' },
      { status: 400 }
    )
  }

  try {
    const template = await prisma.csvTemplate.create({
      data: {
        name,
        description,
        mainTable,
        fields: {
          create: fields.map((f: { columnName: string; fieldPath: string; sortOrder: number }) => ({
            columnName: f.columnName,
            fieldPath: f.fieldPath,
            sortOrder: f.sortOrder,
          })),
        },
      },
      include: { fields: { orderBy: { sortOrder: 'asc' } } },
    })
    return NextResponse.json(template)
  } catch {
    const t = addTemplate({ name, description, mainTable, fields })
    return NextResponse.json(t)
  }
}
