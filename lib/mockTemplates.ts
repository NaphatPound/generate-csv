export interface MockField {
  columnName: string
  fieldPath: string
  sortOrder: number
}

export interface MockTemplate {
  id: string
  name: string
  description: string
  mainTable: string
  createdAt: string
  updatedAt: string
  fields: MockField[]
}

export const MOCK_TEMPLATES: MockTemplate[] = [
  {
    id: 'mock-template-1',
    name: 'ลูกค้าทั้งหมด',
    description: 'รายชื่อลูกค้าทั้งหมดในระบบ',
    mainTable: 'customers',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    fields: [
      { columnName: 'ชื่อ', fieldPath: 'firstName', sortOrder: 1 },
      { columnName: 'นามสกุล', fieldPath: 'lastName', sortOrder: 2 },
      { columnName: 'เบอร์โทร', fieldPath: 'phone', sortOrder: 3 },
      { columnName: 'อีเมล', fieldPath: 'email', sortOrder: 4 },
      { columnName: 'จังหวัด', fieldPath: 'province', sortOrder: 5 },
      { columnName: 'สถานะ', fieldPath: 'status', sortOrder: 6 },
      { columnName: 'วันที่สร้าง', fieldPath: 'createdAt', sortOrder: 7 },
    ],
  },
  {
    id: 'mock-template-2',
    name: 'โครงการทั้งหมด',
    description: 'รายชื่อโครงการทั้งหมด',
    mainTable: 'projects',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    fields: [
      { columnName: 'ชื่อโครงการ', fieldPath: 'name', sortOrder: 1 },
      { columnName: 'ที่ตั้ง', fieldPath: 'location', sortOrder: 2 },
      { columnName: 'สถานะ', fieldPath: 'status', sortOrder: 3 },
      { columnName: 'เป้าหมาย (ปี)', fieldPath: 'targetYear', sortOrder: 4 },
    ],
  },
  {
    id: 'mock-template-3',
    name: 'แปลงที่ดินว่าง',
    description: 'รายการแปลงที่ดินที่ยังไม่ถูกจอง',
    mainTable: 'plots',
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-02-01T00:00:00Z',
    fields: [
      { columnName: 'แปลงเลขที่', fieldPath: 'plotNumber', sortOrder: 1 },
      { columnName: 'ขนาด (ตรว.)', fieldPath: 'size', sortOrder: 2 },
      { columnName: 'ราคา', fieldPath: 'price', sortOrder: 3 },
      { columnName: 'สถานะ', fieldPath: 'status', sortOrder: 4 },
      { columnName: 'แบบบ้าน', fieldPath: 'houseType', sortOrder: 5 },
    ],
  },
  {
    id: 'mock-template-4',
    name: 'ใบเสนอราคา',
    description: 'รายการใบเสนอราคาทั้งหมด',
    mainTable: 'quotations',
    createdAt: '2025-02-15T00:00:00Z',
    updatedAt: '2025-02-15T00:00:00Z',
    fields: [
      { columnName: 'เลขที่ใบเสนอราคา', fieldPath: 'quotationNumber', sortOrder: 1 },
      { columnName: 'ราคา', fieldPath: 'price', sortOrder: 2 },
      { columnName: 'มัดจำ', fieldPath: 'deposit', sortOrder: 3 },
      { columnName: 'สถานะ', fieldPath: 'status', sortOrder: 4 },
      { columnName: 'วันที่สร้าง', fieldPath: 'createdAt', sortOrder: 5 },
    ],
  },
]

export function getMockTemplates(): MockTemplate[] {
  return MOCK_TEMPLATES
}
