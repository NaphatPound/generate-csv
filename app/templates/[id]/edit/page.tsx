'use client'

import { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Space,
  message,
  Divider,
  Row,
  Col,
  Spin,
} from 'antd'
import { PlusOutlined, MinusCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import type { CsvTemplateData, TemplateFieldData } from '@/types'

const KNOWN_TABLES = [
  { label: 'customers', value: 'customers' },
  { label: 'projects', value: 'projects' },
  { label: 'plots', value: 'plots' },
  { label: 'quotations', value: 'quotations' },
  { label: 'reservations', value: 'reservations' },
]

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const templateId = params.id as string

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${templateId}`)
        if (response.ok) {
          const data: CsvTemplateData = await response.json()
          form.setFieldsValue({
            name: data.name,
            description: data.description,
            mainTable: data.mainTable,
            fields: data.fields.map((f: TemplateFieldData) => ({
              columnName: f.columnName,
              fieldPath: f.fieldPath,
            })),
          })
        } else {
          message.error('Template not found')
          router.push('/templates')
        }
      } catch {
        message.error('Failed to load template')
      } finally {
        setFetchLoading(false)
      }
    }
    fetchTemplate()
  }, [templateId, form, router])

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          mainTable: values.mainTable,
          fields: values.fields.map((f: any, i: number) => ({
            columnName: f.columnName,
            fieldPath: f.fieldPath,
            sortOrder: i + 1,
          })),
        }),
      })

      if (response.ok) {
        message.success('Template updated successfully')
        router.push('/templates')
      } else {
        const err = await response.json()
        message.error(err.error || 'Failed to update template')
      }
    } catch {
      message.error('Failed to update template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/templates')}>
          Back
        </Button>
      </Space>
      <Typography.Title level={3}>Edit Template</Typography.Title>

      <Card style={{ maxWidth: 800 }}>
        {fetchLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Template Name"
                  rules={[{ required: true, message: 'Please enter template name' }]}
                >
                  <Input placeholder="e.g., All Customers" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="mainTable"
                  label="Main Table"
                  rules={[{ required: true, message: 'Please select a table' }]}
                >
                  <Select
                    placeholder="Select database table"
                    options={KNOWN_TABLES}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={2} placeholder="Optional description" />
            </Form.Item>

            <Divider>Field Mappings</Divider>

            <Form.List name="fields">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                      <Col flex="auto">
                        <Space style={{ width: '100%' }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'columnName']}
                            rules={[{ required: true, message: 'Column name required' }]}
                            style={{ marginBottom: 0, width: 200 }}
                          >
                            <Input placeholder="CSV Column Header" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'fieldPath']}
                            rules={[{ required: true, message: 'Field path required' }]}
                            style={{ marginBottom: 0, width: 250 }}
                          >
                            <Input placeholder="e.g., firstName, email" />
                          </Form.Item>
                        </Space>
                      </Col>
                      <Col>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Add Field
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Template
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </MainLayout>
  )
}
