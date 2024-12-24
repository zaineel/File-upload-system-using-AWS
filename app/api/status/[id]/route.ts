import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import type { FileTableItem } from '@/types/database'

const dynamodb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION! })
)

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { Item } = await dynamodb.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: { id: params.id }
    }))

    if (!Item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const item = Item as FileTableItem
    const isProcessing = !item.output_file_path

    return NextResponse.json({
      status: isProcessing ? 'processing' : 'completed',
      data: item
    })
  } catch (error) {
    console.error('Error checking status:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}

