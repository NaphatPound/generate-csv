import { getMinioClient } from '@/lib/minio'

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'csv-exports'

function convertToPublicUrl(presignedUrl: string): string {
  const publicUrl = process.env.MINIO_PUBLIC_URL
  if (!publicUrl) return presignedUrl

  try {
    const url = new URL(presignedUrl)
    const publicUrlObj = new URL(publicUrl)
    url.protocol = publicUrlObj.protocol
    url.hostname = publicUrlObj.hostname
    url.port = publicUrlObj.port
    return url.toString()
  } catch {
    return presignedUrl
  }
}

export async function ensureBucketExists() {
  const minioClient = getMinioClient()
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME)
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
      console.log(`Bucket ${BUCKET_NAME} created`)
    }
  } catch (error: any) {
    if (error.code === 'SignatureDoesNotMatch') {
      console.error('MinIO auth failed: check MINIO_ACCESS_KEY and MINIO_SECRET_KEY')
    }
    console.error('MinIO bucket error:', error)
    throw error
  }
}

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const minioClient = getMinioClient()
  await ensureBucketExists()

  const objectName = `csv/${Date.now()}-${fileName}`
  const metaData = { 'Content-Type': mimeType }

  try {
    await minioClient.putObject(BUCKET_NAME, objectName, fileBuffer, fileBuffer.length, metaData)
    return objectName
  } catch (error) {
    console.error('Error uploading to MinIO:', error)
    throw error
  }
}

export async function getFileUrl(objectName: string): Promise<string> {
  const minioClient = getMinioClient()
  try {
    const presignedUrl = await minioClient.presignedGetObject(BUCKET_NAME, objectName, 7 * 24 * 60 * 60)
    return convertToPublicUrl(presignedUrl)
  } catch (error) {
    console.error('Error getting file URL:', error)
    throw error
  }
}

export async function deleteFile(objectName: string): Promise<void> {
  const minioClient = getMinioClient()
  try {
    await minioClient.removeObject(BUCKET_NAME, objectName)
  } catch (error) {
    console.error('Error deleting file from MinIO:', error)
    throw error
  }
}
