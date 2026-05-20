'use client'

import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Typography } from 'antd'
import { FileTextOutlined, DatabaseOutlined } from '@ant-design/icons'
import MainLayout from '@/components/MainLayout'

export default function DashboardPage() {
  const [templateCount, setTemplateCount] = useState<number>(0)

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => setTemplateCount(data.length))
      .catch(() => {})
  }, [])

  return (
    <MainLayout>
      <Typography.Title level={3}>Dashboard</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Total Templates"
              value={templateCount}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Database Tables"
              value={5}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </MainLayout>
  )
}
