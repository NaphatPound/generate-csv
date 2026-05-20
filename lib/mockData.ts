export const MOCK_TABLES: Record<string, Record<string, any>[]> = {
  customers: [
    { id: '1', firstName: 'สมชาย', lastName: 'ใจดี', phone: '081-234-5678', email: 'somchai@email.com', status: 'ติดต่อ', province: 'กรุงเทพฯ', createdAt: '2025-01-15' },
    { id: '2', firstName: 'วิภา', lastName: 'สวยงาม', phone: '082-345-6789', email: 'wipha@email.com', status: 'เสนอราคา', province: 'ชลบุรี', createdAt: '2025-02-20' },
    { id: '3', firstName: 'ประชา', lastName: 'รักดี', phone: '083-456-7890', email: 'prachya@email.com', status: 'จอง', province: 'ระยอง', createdAt: '2025-03-10' },
    { id: '4', firstName: 'มานี', lastName: 'มั่งมี', phone: '084-567-8901', email: 'manee@email.com', status: 'ติดต่อ', province: 'นนทบุรี', createdAt: '2025-03-22' },
    { id: '5', firstName: 'John', lastName: 'Smith', phone: '085-678-9012', email: 'john@email.com', status: 'เสนอราคา', province: 'ภูเก็ต', createdAt: '2025-04-01' },
  ],
  projects: [
    { id: '1', name: 'แอด วิลเลจ', description: 'โครงการบ้านเดี่ยวหรู', location: 'บางใหญ่', status: 'active', targetYear: 2025, targetAmount: 500000000, createdAt: '2025-01-01' },
    { id: '2', name: 'เมโทร ทาวน์', description: 'โครงการทาวน์โฮม', location: 'บางนา', status: 'active', targetYear: 2025, targetAmount: 300000000, createdAt: '2025-01-15' },
    { id: '3', name: 'การ์เด้น โฮม', description: 'โครงการบ้านจัดสรร', location: 'รังสิต', status: 'inactive', targetYear: 2024, targetAmount: 200000000, createdAt: '2024-06-01' },
  ],
  plots: [
    { id: '1', projectId: '1', plotNumber: 'A01', size: 80, price: 8500000, status: 'available', houseType: 'บ้านเดี่ยว 2 ชั้น', createdAt: '2025-01-01' },
    { id: '2', projectId: '1', plotNumber: 'A02', size: 80, price: 8500000, status: 'reserved', houseType: 'บ้านเดี่ยว 2 ชั้น', createdAt: '2025-01-01' },
    { id: '3', projectId: '1', plotNumber: 'B01', size: 60, price: 5500000, status: 'available', houseType: 'บ้านแฝด', createdAt: '2025-01-01' },
    { id: '4', projectId: '2', plotNumber: 'C01', size: 40, price: 4200000, status: 'sold', houseType: 'ทาวน์โฮม', createdAt: '2025-01-15' },
    { id: '5', projectId: '2', plotNumber: 'C02', size: 40, price: 4200000, status: 'available', houseType: 'ทาวน์โฮม', createdAt: '2025-01-15' },
  ],
  quotations: [
    { id: '1', quotationNumber: 'Q-2025-001', customerId: '1', plotId: '1', price: 8500000, deposit: 50000, status: 'approved', createdAt: '2025-02-01' },
    { id: '2', quotationNumber: 'Q-2025-002', customerId: '2', plotId: '3', price: 5500000, deposit: 30000, status: 'sent', createdAt: '2025-03-01' },
    { id: '3', quotationNumber: 'Q-2025-003', customerId: '3', plotId: '5', price: 4200000, deposit: 20000, status: 'draft', createdAt: '2025-03-15' },
    { id: '4', quotationNumber: 'Q-2025-004', customerId: '4', plotId: '2', price: 8500000, deposit: 50000, status: 'approved', createdAt: '2025-04-01' },
  ],
  reservations: [
    { id: '1', reservationNumber: 'R-2025-001', customerId: '3', plotId: '4', price: 4200000, deposit: 50000, status: 'active', reservedAt: '2025-03-20', createdAt: '2025-03-20' },
    { id: '2', reservationNumber: 'R-2025-002', customerId: '1', plotId: '2', price: 8500000, deposit: 100000, status: 'active', reservedAt: '2025-04-01', createdAt: '2025-04-01' },
  ],
}

export const MOCK_TABLE_COLUMNS: Record<string, string[]> = {
  customers: ['id', 'firstName', 'lastName', 'phone', 'email', 'status', 'province', 'createdAt'],
  projects: ['id', 'name', 'description', 'location', 'status', 'targetYear', 'targetAmount', 'createdAt'],
  plots: ['id', 'projectId', 'plotNumber', 'size', 'price', 'status', 'houseType', 'createdAt'],
  quotations: ['id', 'quotationNumber', 'customerId', 'plotId', 'price', 'deposit', 'status', 'createdAt'],
  reservations: ['id', 'reservationNumber', 'customerId', 'plotId', 'price', 'deposit', 'status', 'reservedAt', 'createdAt'],
}

export function getMockData(tableName: string): Record<string, any>[] {
  return MOCK_TABLES[tableName] || []
}

export function filterMockData(
  data: Record<string, any>[],
  selectFields: string[],
  filters?: Record<string, string>
): Record<string, any>[] {
  let filtered = [...data]

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        filtered = filtered.filter((row) => {
          const cell = String(row[key] ?? '').toLowerCase()
          return cell.includes(value.toLowerCase())
        })
      }
    }
  }

  if (selectFields.length > 0) {
    filtered = filtered.map((row) => {
      const picked: Record<string, any> = {}
      for (const field of selectFields) {
        picked[field] = row[field]
      }
      return picked
    })
  }

  return filtered
}
