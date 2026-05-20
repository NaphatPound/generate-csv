import { NextRequest, NextResponse } from 'next/server'
import { getExportById, deleteExportById } from '@/lib/exportStore'
import { getFileUrl, deleteFile } from '@/services/storageService'

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const record = await getExportById(params.id)
    if (!record) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 })
    }
    let url: string | null = null
    try {
      url = await getFileUrl(record.objectName)
    } catch {}
    return NextResponse.json({ ...record, downloadUrl: url })
  } catch (error) {
    console.error('Error fetching export:', error)
    return NextResponse.json({ error: 'Failed to fetch export' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const record = await getExportById(params.id)
    if (!record) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 })
    }
    try {
      await deleteFile(record.objectName)
    } catch {
      console.warn('Failed to delete file from MinIO, removing record anyway')
    }
    await deleteExportById(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting export:', error)
    return NextResponse.json({ error: 'Failed to delete export' }, { status: 500 })
  }
}
