#!/bin/bash

FILE_PATH="/Users/rcarrion/data/r-docs_readings/Networking/Networking for dummies all in one/b1 getting started with nw/ch003/003-Switches, Routers, and VLANs.md"

# Use sed to replace ". " with "\r\n\r\n" in place (macOS-compatible)
sed -i '' 's/\. /. ________|________ /g' "$FILE_PATH"

sed -i '' 's/ / /g' "$FILE_PATH"

sed -i '' 's|!\[Bullet\](https://learning\.oreilly\.com/api/v2/epubs/urn:orm:book:9781394278381/files/images/check\.png)|Bullet :|g' "$FILE_PATH"

echo "Replacement completed in $FILE_PATH"

