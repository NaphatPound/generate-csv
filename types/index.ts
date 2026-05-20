export interface CsvTemplateData {
  id: string
  name: string
  description: string | null
  mainTable: string
  createdAt: string
  updatedAt: string
  fields: TemplateFieldData[]
}

export interface TemplateFieldData {
  id: string
  templateId: string
  columnName: string
  fieldPath: string
  sortOrder: number
}

export interface GenerateCsvRequest {
  templateId: string
  filters?: Record<string, string>
}

export interface PreviewCsvRequest {
  templateId: string
  filters?: Record<string, string>
}

export interface CsvExportRecord {
  id: string
  templateId: string
  templateName: string
  fileName: string
  objectName: string
  fileSize: number | null
  rowCount: number | null
  createdAt: string
  downloadUrl?: string | null
}
