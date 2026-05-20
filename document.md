# Generate CSV - Project Documentation

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI Library**: Ant Design 5
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma 7 ORM
- **File Storage**: MinIO (S3-compatible)

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── csv/
│   │   │   ├── route.ts            # API info/discoverability
│   │   │   ├── generate/route.ts   # CSV generation + MinIO upload
│   │   │   └── preview/route.ts    # Preview first 10 rows
│   │   ├── csv-exports/
│   │   │   ├── route.ts            # List all CSV exports
│   │   │   └── [id]/route.ts       # Get/Delete export
│   │   └── templates/
│   │       ├── route.ts            # CRUD templates
│   │       └── [id]/route.ts       # Get/Update/Delete template
│   ├── csv-exports/
│   │   └── page.tsx                # UI: list generated CSV files
│   ├── templates/
│   │   ├── page.tsx                # UI: list all templates
│   │   ├── create/page.tsx         # UI: create template
│   │   └── [id]/edit/page.tsx      # UI: edit template
│   ├── page.tsx                    # Dashboard
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── ClientProviders.tsx         # Ant Design providers
│   └── MainLayout.tsx              # Sidebar + header layout
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── mockData.ts                 # Mock table data (5 tables)
│   ├── mockTemplates.ts            # 4 pre-built sample templates
│   ├── mockStore.ts                # Shared mutable mock template store
│   ├── exportStore.ts              # CSV export records store
│   ├── minio.ts                    # MinIO client
│   └── resolveData.ts              # DB-first, mock-fallback resolver
├── services/
│   └── storageService.ts           # MinIO upload/download/delete
├── types/
│   ├── index.ts                    # TypeScript interfaces
│   └── minio.d.ts                  # Minio type declarations
└── prisma/
    ├── schema.prisma               # CsvTemplate, TemplateField, CsvExport
    └── seed.ts                     # Sample template seed
```

---

## Database Schema

### CsvTemplate
| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| name | String (unique) | Template name |
| description | String? | Description |
| mainTable | String | Database table to query |
| createdAt | DateTime | Auto-generated |
| updatedAt | DateTime | Auto-generated |

### TemplateField
| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| templateId | String | FK to CsvTemplate |
| columnName | String | CSV column header |
| fieldPath | String | Database field path |
| sortOrder | Int | Column ordering |
| createdAt | DateTime | Auto-generated |

### CsvExport
| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| templateId | String | Template used |
| templateName | String | Template name snapshot |
| fileName | String | Display filename |
| objectName | String | MinIO object path |
| fileSize | Int? | File size in bytes |
| rowCount | Int? | Number of data rows |
| createdAt | DateTime | Auto-generated |

---

## Mock Data (No Database Required)

The project includes built-in mock data. When a PostgreSQL database is not configured, all APIs fall back to mock data automatically.

### Pre-loaded Templates

| ID | Name | Table | Fields |
|----|------|-------|--------|
| mock-template-1 | ลูกค้าทั้งหมด | customers | ชื่อ, นามสกุล, เบอร์โทร, อีเมล, จังหวัด, สถานะ, วันที่สร้าง |
| mock-template-2 | โครงการทั้งหมด | projects | ชื่อโครงการ, ที่ตั้ง, สถานะ, เป้าหมาย |
| mock-template-3 | แปลงที่ดินว่าง | plots | แปลงเลขที่, ขนาด, ราคา, สถานะ, แบบบ้าน |
| mock-template-4 | ใบเสนอราคา | quotations | เลขที่, ราคา, มัดจำ, สถานะ, วันที่สร้าง |

### Mock Tables

| Table | Records | Fields |
|-------|---------|--------|
| customers | 5 | id, firstName, lastName, phone, email, status, province |
| projects | 3 | id, name, description, location, status, targetYear, targetAmount |
| plots | 5 | id, projectId, plotNumber, size, price, status, houseType |
| quotations | 4 | id, quotationNumber, customerId, price, deposit, status |
| reservations | 2 | id, reservationNumber, customerId, price, deposit, status |

---

# API Documentation

Base URL: `http://localhost:3003`

---

## 1. API Info

Discover all available endpoints.

```
GET /api/csv
```

**Response 200:**
```json
{
  "service": "Generate CSV",
  "version": "1.0.0",
  "endpoints": {
    "listTemplates": { "method": "GET", "url": "/api/templates" },
    "getTemplate": { "method": "GET", "url": "/api/templates/:id" },
    "generateCsv": { "method": "GET", "url": "/api/csv/generate?templateId=:id" },
    "generateCsvPost": { "method": "POST", "url": "/api/csv/generate" },
    "previewCsv": { "method": "POST", "url": "/api/csv/preview" }
  }
}
```

---

## 2. List All Templates

```
GET /api/templates
```

**Response 200:**
```json
[
  {
    "id": "mock-template-1",
    "name": "ลูกค้าทั้งหมด",
    "description": "รายชื่อลูกค้าทั้งหมดในระบบ",
    "mainTable": "customers",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "fields": [
      { "id": "1", "templateId": "mock-template-1", "columnName": "ชื่อ", "fieldPath": "firstName", "sortOrder": 1 },
      { "id": "2", "templateId": "mock-template-1", "columnName": "นามสกุล", "fieldPath": "lastName", "sortOrder": 2 }
    ]
  }
]
```

---

## 3. Get Template by ID

```
GET /api/templates/:id
```

**Response 200:** Single template object with fields.
**Response 404:** `{ "error": "Template not found" }`

---

## 4. Create Template

```
POST /api/templates
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Template",
  "description": "Optional description",
  "mainTable": "customers",
  "fields": [
    { "columnName": "Name", "fieldPath": "firstName" },
    { "columnName": "Phone", "fieldPath": "phone" }
  ]
}
```

**Response 201:** Created template with fields.

---

## 5. Update Template

```
PUT /api/templates/:id
Content-Type: application/json
```

**Request Body:** Same structure as Create.
**Response 200:** Updated template.
**Response 404:** Template not found.

---

## 6. Delete Template

```
DELETE /api/templates/:id
```

**Response 200:** `{ "success": true }`
**Response 404:** Template not found.

---

## 7. Generate CSV

Generates a CSV file, uploads it to MinIO, and returns the file as a download.

```
POST /api/csv/generate
Content-Type: application/json
```

**Request Body:**
```json
{
  "templateId": "mock-template-1",
  "filters": {
    "status": "ติดต่อ"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| templateId | string | Yes | Template ID |
| filters | object | No | Field filter conditions |

**Response 200:** Binary CSV file with headers:
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="filename.csv"`
- `X-Export-Id`: Record ID in CsvExports

**Response 400:** `{ "error": "templateId is required" }`
**Response 404:** `{ "error": "Template not found" }`

**curl:**
```bash
curl -X POST http://localhost:3003/api/csv/generate \
  -H 'Content-Type: application/json' \
  -d '{"templateId":"mock-template-1"}' \
  -o output.csv

# With filters
curl -X POST http://localhost:3003/api/csv/generate \
  -H 'Content-Type: application/json' \
  -d '{"templateId":"mock-template-1","filters":{"status":"ติดต่อ"}}' \
  -o filtered.csv
```

### GET Method

```
GET /api/csv/generate?templateId=mock-template-1
GET /api/csv/generate?templateId=mock-template-1&status=ติดต่อ
GET /api/csv/generate?templateId=mock-template-1&format=json
```

| Query Param | Required | Description |
|-------------|----------|-------------|
| templateId | Yes | Template ID |
| format | No | Set to `json` for JSON response instead of file download |
| `{field}` | No | Any additional query params are treated as filters |

**curl:**
```bash
# Simple GET download
curl "http://localhost:3003/api/csv/generate?templateId=mock-template-1" -o output.csv

# JSON response (for programmatic consumption)
curl "http://localhost:3003/api/csv/generate?templateId=mock-template-1&format=json"

# With filters
curl "http://localhost:3003/api/csv/generate?templateId=mock-template-1&status=เสนอราคา&format=json"
```

**JSON format response:**
```json
{
  "template": { "id": "mock-template-1", "name": "ลูกค้าทั้งหมด" },
  "headers": ["ชื่อ", "นามสกุล", "เบอร์โทร", "อีเมล", "จังหวัด", "สถานะ", "วันที่สร้าง"],
  "rows": [
    ["สมชาย", "ใจดี", "081-234-5678", "somchai@email.com", "กรุงเทพฯ", "ติดต่อ", "2025-01-15"]
  ],
  "total": 5,
  "csv": "ชื่อ,นามสกุล,เบอร์โทร,อีเมล,จังหวัด,สถานะ,วันที่สร้าง\r\nสมชาย,ใจดี,081-234-5678,...",
  "export": {
    "id": "mock-export-1",
    "fileName": "ลูกค้าทั้งหมด.csv",
    "rowCount": 5,
    "fileSize": 312,
    "createdAt": "2026-05-20T11:13:40.000Z"
  }
}
```

---

## 8. Preview CSV

Returns JSON with headers and first 10 data rows.

```
POST /api/csv/preview
Content-Type: application/json
```

**Request Body:**
```json
{
  "templateId": "mock-template-1",
  "filters": {
    "status": "ติดต่อ"
  }
}
```

**Response 200:**
```json
{
  "total": 5,
  "headers": ["ชื่อ", "นามสกุล", "เบอร์โทร"],
  "rows": [["สมชาย", "ใจดี", "081-234-5678"]],
  "template": {
    "id": "mock-template-1",
    "name": "ลูกค้าทั้งหมด",
    "mainTable": "customers",
    "fieldCount": 7
  }
}
```

---

## 9. List CSV Exports

Returns all generated CSV files across all sessions.

```
GET /api/csv-exports
```

**Response 200:**
```json
[
  {
    "id": "mock-export-1",
    "templateId": "mock-template-1",
    "templateName": "ลูกค้าทั้งหมด",
    "fileName": "ลูกค้าทั้งหมด.csv",
    "objectName": "csv/1716198820000-ลูกค้าทั้งหมด.csv",
    "fileSize": 312,
    "rowCount": 5,
    "createdAt": "2026-05-20T11:13:40.000Z"
  }
]
```

---

## 10. Get Export Detail (with Download URL)

```
GET /api/csv-exports/:id
```

**Response 200:**
```json
{
  "id": "mock-export-1",
  "fileName": "ลูกค้าทั้งหมด.csv",
  "rowCount": 5,
  "downloadUrl": "http://localhost:9000/csv-exports/csv/1716198820000-...?X-Amz-Algorithm=..."
}
```

**Response 404:** Export not found.

---

## 11. Delete Export

Removes from MinIO storage and database record.

```
DELETE /api/csv-exports/:id
```

**Response 200:** `{ "success": true }`
**Response 404:** Export not found.

---

# Environment Variables

Create a `.env` file from `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/generate-csv"

# MinIO (optional — will still work with mock fallback)
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
MINIO_BUCKET_NAME="csv-exports"
MINIO_PUBLIC_URL=""
```

> **Note:** Without a real PostgreSQL or MinIO, the app uses built-in mock data automatically. All features work without external services.

---

# Development Commands

```bash
npm install           # Install dependencies
npm run dev           # Start dev server (http://localhost:3000)
npx next dev -p 3003  # Start on custom port

npx prisma generate   # Generate Prisma client
npx prisma migrate dev  # Run migrations (PostgreSQL required)
npx prisma db seed    # Seed sample data
npx prisma studio     # Open Prisma Studio

npm run build         # Production build
npm run start         # Start production server
```
