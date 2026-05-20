import { prisma } from '@/lib/prisma'
import { findTemplate } from '@/lib/mockStore'
import { getMockData, filterMockData } from '@/lib/mockData'

interface TemplateWithFields {
  id: string
  name: string
  mainTable: string
  fields: { columnName: string; fieldPath: string; sortOrder: number }[]
}

export async function resolveTemplate(id: string): Promise<TemplateWithFields | null> {
  try {
    const template = await prisma.csvTemplate.findUnique({
      where: { id },
      include: { fields: { orderBy: { sortOrder: 'asc' } } },
    })
    if (template) return template
  } catch {}

  const mock = findTemplate(id)
  if (mock) {
    return {
      id: mock.id,
      name: mock.name,
      mainTable: mock.mainTable,
      fields: mock.fields.map((f) => ({
        columnName: f.columnName,
        fieldPath: f.fieldPath,
        sortOrder: f.sortOrder,
      })),
    }
  }
  return null
}

export async function resolveData(
  tableName: string,
  fieldPaths: string[],
  filters?: Record<string, string>,
  limit?: number
): Promise<Record<string, any>[]> {
  const selectFields: Record<string, boolean> = {}
  for (const field of fieldPaths) {
    selectFields[field] = true
  }

  const where: Record<string, any> = {}
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        where[key] = { contains: value, mode: 'insensitive' }
      }
    }
  }

  try {
    const data = await (prisma as any)[tableName as keyof typeof prisma].findMany({
      select: selectFields,
      where: Object.keys(where).length > 0 ? where : undefined,
      ...(limit ? { take: limit } : {}),
    })
    if (data && data.length > 0) return data
  } catch {}

  const mockRows = getMockData(tableName)
  if (mockRows.length === 0) return []

  const filtered = filterMockData(mockRows, fieldPaths, filters)
  return limit ? filtered.slice(0, limit) : filtered
}
