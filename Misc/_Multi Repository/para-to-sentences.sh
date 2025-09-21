#!/bin/bash

FILE_PATH="/Users/rcarrion/data/r-docs_readings/CloudNative/CN Devops orielly/005-Open-Source Tools for Cloud-Native DevOps.md"

# Use sed to replace ". " with "\r\n\r\n" in place (macOS-compatible)
sed -i '' 's/\. /\r\n~\r\n~\r\n/g' "$FILE_PATH"

echo "Replacement completed in $FILE_PATH"