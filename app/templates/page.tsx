'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Modal,
  Form,
  Select,
  message,
  Typography,
  Card,
  Row,
  Col,
  Input,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import type { CsvTemplateData } from '@/types'

const KNOWN_TABLES = [
  { label: 'customers', value: 'customers' },
  { label: 'projects', value: 'projects' },
  { label: 'plots', value: 'plots' },
  { label: 'quotations', value: 'quotations' },
  { label: 'reservations', value: 'reservations' },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<CsvTemplateData[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null)

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch {
      message.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id)
      const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (response.ok) {
        message.success('Template deleted')
        fetchTemplates()
      } else {
        message.error('Failed to delete template')
      }
    } catch {
      message.error('Failed to delete template')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handlePreview = async (id: string) => {
    setPreviewTemplateId(id)
    setPreviewLoading(true)
    setPreviewOpen(true)
    try {
      const response = await fetch('/api/csv/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: id }),
      })
      if (response.ok) {
        const data = await response.json()
        setPreviewData(data)
      } else {
        message.error('Failed to preview CSV')
      }
    } catch {
      message.error('Failed to preview CSV')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleGenerateCsv = async (id: string) => {
    try {
      const response = await fetch('/api/csv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: id }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const template = templates.find((t) => t.id === id)
        a.download = `${template?.name || 'export'}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        message.success('CSV downloaded')
      } else {
        message.error('Failed to generate CSV')
      }
    } catch {
      message.error('Failed to generate CSV')
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: CsvTemplateData) => (
        <a onClick={() => router.push(`/templates/${record.id}/edit`)}>{name}</a>
      ),
    },
    {
      title: 'Main Table',
      dataIndex: 'mainTable',
      key: 'mainTable',
      render: (table: string) => <Tag color="blue">{table}</Tag>,
    },
    {
      title: 'Fields',
      key: 'fields',
      render: (_: any, record: CsvTemplateData) => (
        <Space size={[0, 4]} wrap>
          {record.fields.map((f) => (
            <Tag key={f.id}>{f.columnName}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CsvTemplateData) => (
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => handleGenerateCsv(record.id)}
          >
            Export CSV
          </Button>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handlePreview(record.id)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => router.push(`/templates/${record.id}/edit`)}
          />
          <Popconfirm
            title="Delete template?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={deleteLoading === record.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <MainLayout>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            CSV Templates
          </Typography.Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/templates/create')}
          >
            Create Template
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={templates}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title="Preview CSV Data"
        open={previewOpen}
        onCancel={() => {
          setPreviewOpen(false)
          setPreviewData(null)
        }}
        footer={null}
        width={800}
      >
        {previewLoading ? (
          <p>Loading preview...</p>
        ) : previewData ? (
          <div>
            <p>
              <strong>Template:</strong> {previewData.template.name} |{' '}
              <strong>Table:</strong> {previewData.template.mainTable} |{' '}
              <strong>Rows:</strong> {previewData.total}
            </p>
            <Table
              columns={previewData.headers.map((h: string) => ({
                title: h,
                dataIndex: h,
                key: h,
                ellipsis: true,
              }))}
              dataSource={previewData.rows.map((row: string[], i: number) => {
                const obj: Record<string, string> = {}
                previewData.headers.forEach((h: string, j: number) => {
                  obj[h] = row[j]
                })
                obj._key = String(i)
                return obj
              })}
              rowKey="_key"
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleGenerateCsv(previewTemplateId!)}
              style={{ marginTop: 16 }}
            >
              Download Full CSV
            </Button>
          </div>
        ) : null}
      </Modal>
    </MainLayout>
  )
}
