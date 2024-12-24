import { NextResponse } from 'next/server'
import { EC2Client, RunInstancesCommand, CreateTagsCommand } from '@aws-sdk/client-ec2'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync } from 'fs'
import { join } from 'path'

const ec2 = new EC2Client({ region: process.env.AWS_REGION! })
const s3 = new S3Client({ region: process.env.AWS_REGION! })

// Read the script file
const scriptPath = join(process.cwd(), 'scripts', 'process-file.sh')
const processingScript = readFileSync(scriptPath, 'utf-8')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const record = body.Records[0]
    const id = record.dynamodb.NewImage.id.S

    // Upload the processing script to S3
    const scriptKey = `${id}/process.sh`
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: scriptKey,
      Body: processingScript,
      ContentType: 'text/x-sh'
    }))

    // Create EC2 instance with bootstrap script
    const bootstrapScript = `#!/bin/bash
aws s3 cp s3://${process.env.S3_BUCKET_NAME}/${scriptKey} /tmp/process.sh
chmod +x /tmp/process.sh
export S3_BUCKET_NAME=${process.env.S3_BUCKET_NAME}
export DYNAMODB_TABLE_NAME=${process.env.DYNAMODB_TABLE_NAME}
/tmp/process.sh ${id}`

    const instanceParams = {
      ImageId: 'ami-0c55b159cbfafe1f0', // Amazon Linux 2 AMI ID
      InstanceType: 't2.micro',
      MinCount: 1,
      MaxCount: 1,
      UserData: Buffer.from(bootstrapScript).toString('base64'),
      IamInstanceProfile: {
        Name: 'EC2ProcessingRole' // Role with S3 and DynamoDB access
      }
    }

    const { Instances } = await ec2.send(new RunInstancesCommand(instanceParams))
    const instanceId = Instances?.[0].InstanceId

    if (instanceId) {
      await ec2.send(new CreateTagsCommand({
        Resources: [instanceId],
        Tags: [
          {
            Key: 'Name',
            Value: `FileProcessor-${id}`
          }
        ]
      }))
    }

    return NextResponse.json({ success: true, instanceId })
  } catch (error) {
    console.error('Error processing DynamoDB trigger:', error)
    return NextResponse.json(
      { error: 'Failed to process trigger' }, 
      { status: 500 }
    )
  }
}

