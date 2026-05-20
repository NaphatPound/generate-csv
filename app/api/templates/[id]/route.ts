import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findTemplate, updateTemplate as mockUpdate, deleteTemplate as mockDelete } from '@/lib/mockStore'

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const template = await prisma.csvTemplate.findUnique({
      where: { id: params.id },
      include: { fields: { orderBy: { sortOrder: 'asc' } } },
    })
    if (template) return NextResponse.json(template)
  } catch {}
  const mock = findTemplate(params.id)
  if (mock) return NextResponse.json(mock)
  return NextResponse.json({ error: 'Template not found' }, { status: 404 })
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const body = await request.json()
  const { name, description, mainTable, fields } = body

  try {
    const template = await prisma.csvTemplate.update({
      where: { id: params.id },
      data: {
        name,
        description,
        mainTable,
        fields: {
          deleteMany: {},
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
    const updated = mockUpdate(params.id, { name, description, mainTable, fields })
    if (!updated) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    return NextResponse.json(updated)
  }
}

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    await prisma.csvTemplate.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    const ok = mockDelete(params.id)
    if (!ok) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  }
}
