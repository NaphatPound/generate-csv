import { getMockTemplates, type MockTemplate, type MockField } from './mockTemplates'

let templates: MockTemplate[] = [...getMockTemplates()]
let nextId = 100

export function getTemplates(): MockTemplate[] {
  return templates
}

export function findTemplate(id: string): MockTemplate | undefined {
  return templates.find((t) => t.id === id)
}

export function addTemplate(data: {
  name: string
  description?: string
  mainTable: string
  fields: { columnName: string; fieldPath: string; sortOrder?: number }[]
}): MockTemplate {
  const t: MockTemplate = {
    id: `mock-template-${nextId++}`,
    name: data.name,
    description: data.description || '',
    mainTable: data.mainTable,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: data.fields.map((f, i) => ({
      columnName: f.columnName,
      fieldPath: f.fieldPath,
      sortOrder: f.sortOrder ?? i + 1,
    })),
  }
  templates.unshift(t)
  return t
}

export function updateTemplate(
  id: string,
  data: {
    name: string
    description?: string
    mainTable: string
    fields: { columnName: string; fieldPath: string; sortOrder?: number }[]
  }
): MockTemplate | null {
  const idx = templates.findIndex((t) => t.id === id)
  if (idx === -1) return null
  templates[idx] = {
    ...templates[idx],
    name: data.name,
    description: data.description || '',
    mainTable: data.mainTable,
    fields: data.fields.map((f, i) => ({
      columnName: f.columnName,
      fieldPath: f.fieldPath,
      sortOrder: f.sortOrder ?? i + 1,
    })),
    updatedAt: new Date().toISOString(),
  }
  return templates[idx]
}

export function deleteTemplate(id: string): boolean {
  const idx = templates.findIndex((t) => t.id === id)
  if (idx === -1) return false
  templates.splice(idx, 1)
  return true
}
