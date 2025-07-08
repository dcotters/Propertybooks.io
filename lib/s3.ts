import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const bucketName = process.env.AWS_S3_BUCKET!

export interface UploadFileParams {
  key: string
  body: Buffer | string
  contentType: string
}

export const uploadFile = async (params: UploadFileParams) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    })

    await s3Client.send(command)
    return { success: true, url: `https://${bucketName}.s3.amazonaws.com/${params.key}` }
  } catch (error) {
    console.error('S3 upload failed:', error)
    return { success: false, error }
  }
}

export const getSignedDownloadUrl = async (key: string, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return { success: true, url: signedUrl }
  } catch (error) {
    console.error('S3 signed URL generation failed:', error)
    return { success: false, error }
  }
}

export const deleteFile = async (key: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    await s3Client.send(command)
    return { success: true }
  } catch (error) {
    console.error('S3 delete failed:', error)
    return { success: false, error }
  }
}

export const generateFileKey = (userId: string, fileName: string, type: string) => {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `users/${userId}/${type}/${timestamp}-${sanitizedFileName}`
} 