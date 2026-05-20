'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Typography,
  Row,
  Col,
  message,
  Modal,
} from 'antd'
import {
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import MainLayout from '@/components/MainLayout'
import type { CsvExportRecord } from '@/types'

export default function CsvExportsPage() {
  const [exports, setExports] = useState<CsvExportRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState<string>('')
  const [previewName, setPreviewName] = useState('')

  const fetchExports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/csv-exports')
      if (response.ok) {
        const data = await response.json()
        setExports(data)
      }
    } catch {
      message.error('Failed to load exports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExports()
  }, [])

  const handleDownload = async (record: CsvExportRecord) => {
    try {
      const response = await fetch(`/api/csv-exports/${record.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank')
        } else {
          message.error('Download URL not available')
        }
      }
    } catch {
      message.error('Failed to get download link')
    }
  }

  const handlePreview = async (record: CsvExportRecord) => {
    try {
      const response = await fetch(`/api/csv-exports/${record.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.downloadUrl) {
          const csvResp = await fetch(data.downloadUrl)
          const text = await csvResp.text()
          setPreviewContent(text.slice(0, 5000))
          setPreviewName(record.fileName)
          setPreviewOpen(true)
        } else {
          message.error('Preview not available')
        }
      }
    } catch {
      message.error('Failed to preview file')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/csv-exports/${id}`, { method: 'DELETE' })
      if (response.ok) {
        message.success('Export deleted')
        fetchExports()
      } else {
        message.error('Failed to delete export')
      }
    } catch {
      message.error('Failed to delete export')
    }
  }

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Template',
      dataIndex: 'templateName',
      key: 'templateName',
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: 'Rows',
      dataIndex: 'rowCount',
      key: 'rowCount',
      render: (count: number | null) => count ?? '-',
    },
    {
      title: 'Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number | null) =>
        size ? `${(size / 1024).toFixed(1)} KB` : '-',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CsvExportRecord) => (
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => handleDownload(record)}
          >
            Download
          </Button>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handlePreview(record)}
          />
          <Popconfirm
            title="Delete this export?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
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
            CSV Exports
          </Typography.Title>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={fetchExports}>
            Refresh
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={exports}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={previewName}
        open={previewOpen}
        onCancel={() => {
          setPreviewOpen(false)
          setPreviewContent('')
        }}
        footer={null}
        width={800}
      >
        <pre
          style={{
            maxHeight: 400,
            overflow: 'auto',
            background: '#f5f5f5',
            padding: 16,
            borderRadius: 4,
            fontSize: 13,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {previewContent || 'No content'}
        </pre>
      </Modal>
    </MainLayout>
  )
}
