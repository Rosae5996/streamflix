import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Initialize R2 client
const s3Client = new S3Client({
  region: 'auto',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
})

export async function uploadToR2(
  file: Buffer,
  filename: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<string> {
  const key = `${folder}/${Date.now()}-${filename}`

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await s3Client.send(command)

  // Return the public URL
  const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || `${process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_R2_BUCKET_NAME}`
  return `${baseUrl}/${key}`
}

export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
  })

  await s3Client.send(command)
}

export function extractKeyFromUrl(url: string): string {
  // Extract the key from the full URL
  const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || `${process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_R2_BUCKET_NAME}`
  return url.replace(`${baseUrl}/`, '')
}
