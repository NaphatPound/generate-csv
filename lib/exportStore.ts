import { prisma } from './prisma'

export interface CsvExportRecord {
  id: string
  templateId: string
  templateName: string
  fileName: string
  objectName: string
  fileSize: number | null
  rowCount: number | null
  createdAt: string
}

let mockExports: CsvExportRecord[] = []
let nextId = 1

export async function getExports(): Promise<CsvExportRecord[]> {
  try {
    const records = await prisma.csvExport.findMany({
      orderBy: { createdAt: 'desc' },
    })
    if (records.length > 0) return records as any
  } catch {}
  return [...mockExports]
}

export async function createExport(record: {
  templateId: string
  templateName: string
  fileName: string
  objectName: string
  fileSize: number | null
  rowCount: number | null
}): Promise<CsvExportRecord> {
  try {
    const created = await prisma.csvExport.create({
      data: {
        templateId: record.templateId,
        templateName: record.templateName,
        fileName: record.fileName,
        objectName: record.objectName,
        fileSize: record.fileSize,
        rowCount: record.rowCount,
      },
    })
    return created as any
  } catch {
    const newRecord: CsvExportRecord = {
      id: `mock-export-${nextId++}`,
      ...record,
      createdAt: new Date().toISOString(),
    }
    mockExports.unshift(newRecord)
    return newRecord
  }
}

export async function deleteExportById(id: string): Promise<boolean> {
  try {
    await prisma.csvExport.delete({ where: { id } })
    return true
  } catch {}
  const idx = mockExports.findIndex((e) => e.id === id)
  if (idx === -1) return false
  mockExports.splice(idx, 1)
  return true
}

export async function getExportById(id: string): Promise<CsvExportRecord | null> {
  try {
    const record = await prisma.csvExport.findUnique({ where: { id } })
    if (record) return record as any
  } catch {}
  return mockExports.find((e) => e.id === id) || null
}
