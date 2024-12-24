#!/bin/bash

# Get the ID parameter
ID=$1

# Download input file from S3
aws s3 cp "s3://$S3_BUCKET_NAME/$ID/input.txt" /tmp/input.txt

# Get text input from DynamoDB
input_text=$(aws dynamodb get-item \
  --table-name "$DYNAMODB_TABLE_NAME" \
  --key "{\"id\":{\"S\":\"$ID\"}}" \
  --query 'Item.input_text.S' \
  --output text)

# Process the file - append text length to the content
content=$(cat /tmp/input.txt)
text_length=$(echo -n "$input_text" | wc -c)
echo "$content : $text_length" > /tmp/output.txt

# Upload output file to S3
aws s3 cp /tmp/output.txt "s3://$S3_BUCKET_NAME/$ID/output.txt"

# Update DynamoDB with output path
aws dynamodb update-item \
  --table-name "$DYNAMODB_TABLE_NAME" \
  --key "{\"id\":{\"S\":\"$ID\"}}" \
  --update-expression "SET output_file_path = :path" \
  --expression-attribute-values "{\":path\":{\"S\":\"$S3_BUCKET_NAME/$ID/output.txt\"}}"

# Shutdown instance
shutdown -h now

