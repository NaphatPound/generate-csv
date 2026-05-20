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
