# File Upload Processing System

A serverless file upload system built with Next.js that processes files using AWS services (S3, DynamoDB, and EC2).

## Overview

This system allows users to upload files along with text input, processes them using AWS services, and returns the processed results. The architecture uses a combination of serverless and server-based processing to handle file operations efficiently.

## Features

- File upload with additional text input
- Real-time processing status updates
- Serverless architecture using AWS services
- Automatic EC2 instance management for file processing
- Secure file storage using S3

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: Custom UI components (Button, Input, Label)
- **Cloud Services**:
  - AWS S3 for file storage
  - AWS DynamoDB for data persistence
  - AWS EC2 for file processing
  - AWS IAM for security

## Architecture

1. **Upload Flow**:

   - User uploads a file with text input
   - File is stored in S3
   - Metadata is saved to DynamoDB

2. **Processing Flow**:

   - DynamoDB trigger initiates processing
   - EC2 instance is created automatically
   - Processing script runs on EC2
   - Results are stored back in S3
   - Instance terminates automatically

3. **Status Updates**:
   - Frontend polls status endpoint
   - Real-time updates on processing status
   - Final results displayed upon completion

## Setup

1. **AWS Configuration**:

   - Set up an S3 bucket
   - Create a DynamoDB table
   - Configure IAM roles for EC2 (`EC2ProcessingRole`)
   - Set up necessary environment variables

2. **Environment Variables**:

   ```
   AWS_REGION=<your-region>
   S3_BUCKET_NAME=<your-bucket-name>
   DYNAMODB_TABLE_NAME=<your-table-name>
   ```

3. **Installation**:

   ```bash
   npm install
   # or
   yarn install
   ```

4. **Running the Application**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage

1. Upload a file with text input
2. See the processing status in real-time
3. View the processed results after completion

## API Endpoints

- `POST /api/dynamodb-trigger`: Handles DynamoDB stream events
- `GET /api/status/[id]`: Returns processing status for a specific upload

## Security Considerations

- EC2 instances use IAM roles for secure access
- Automatic instance termination after processing
- Secure file storage in S3
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Zaineel Mithani
