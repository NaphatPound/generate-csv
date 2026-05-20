import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const template = await prisma.csvTemplate.create({
    data: {
      name: 'ลูกค้าทั้งหมด',
      description: 'รายชื่อลูกค้าทั้งหมดในระบบ',
      mainTable: 'customers',
      fields: {
        create: [
          { columnName: 'ชื่อ', fieldPath: 'firstName', sortOrder: 1 },
          { columnName: 'นามสกุล', fieldPath: 'lastName', sortOrder: 2 },
          { columnName: 'เบอร์โทร', fieldPath: 'phone', sortOrder: 3 },
          { columnName: 'อีเมล', fieldPath: 'email', sortOrder: 4 },
          { columnName: 'สถานะ', fieldPath: 'status', sortOrder: 5 },
        ],
      },
    },
  })

  console.log('Seed created:', template.name)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
