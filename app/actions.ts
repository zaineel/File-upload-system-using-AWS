'use server'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { nanoid } from 'nanoid'

const s3 = new S3Client({
  region: process.env.AWS_REGION!
})

const dynamodb = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION!
  })
)

export async function uploadFile(formData: FormData) {
  const inputText = formData.get('inputText') as string
  const file = formData.get('file') as File
  const id = nanoid()
  
  // Upload file to S3
  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const s3Path = `${process.env.S3_BUCKET_NAME}/${id}/${file.name}`
  
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Path,
    Body: fileBuffer
  }))

  // Save to DynamoDB
  await dynamodb.send(new PutCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: {
      id,
      input_text: inputText,
      input_file_path: s3Path,
      created_at: new Date().toISOString()
    }
  }))

  return { success: true, id }
}

