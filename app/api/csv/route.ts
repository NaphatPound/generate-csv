import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'

  return NextResponse.json({
    service: 'Generate CSV',
    version: '1.0.0',
    endpoints: {
      listTemplates: {
        method: 'GET',
        url: `${baseUrl}/api/templates`,
        description: 'List all available CSV templates',
      },
      getTemplate: {
        method: 'GET',
        url: `${baseUrl}/api/templates/:id`,
        description: 'Get a single template with its field mappings',
      },
      generateCsv: {
        method: 'GET',
        url: `${baseUrl}/api/csv/generate?templateId=:id`,
        description: 'Generate CSV as file download',
        params: {
          templateId: '(required) Template ID',
          format: '(optional) Set to "json" to get CSV data as JSON',
          'filters[key]': '(optional) Filter by field value, e.g. status=active',
        },
        example: `${baseUrl}/api/csv/generate?templateId=mock-template-1`,
        exampleJson: `${baseUrl}/api/csv/generate?templateId=mock-template-1&format=json`,
      },
      generateCsvPost: {
        method: 'POST',
        url: `${baseUrl}/api/csv/generate`,
        description: 'Generate CSV as file download (POST with body)',
        body: {
          templateId: '(required) Template ID',
          filters: '(optional) Object of field filters',
        },
      },
      previewCsv: {
        method: 'POST',
        url: `${baseUrl}/api/csv/preview`,
        description: 'Preview CSV data (first 10 rows)',
        body: {
          templateId: '(required) Template ID',
          filters: '(optional) Object of field filters',
        },
      },
    },
  })
}
