#!/bin/bash
# ==========================================
# StockFlow - Daily MySQL Backup to AWS S3
# ==========================================

# 1. Variables
DATE=$(date +%F)
BACKUP_FILE="/tmp/stockflow-backup-$DATE.sql.gz"
S3_BUCKET="s3://stockflow-images-bucket/backups" # Using your existing bucket
DB_PASSWORD="mysecretpassword" # As per docker-compose.yml
CONTAINER_NAME="stockflow_db"

echo "Starting backup for $DATE..."

# 2. Dump the database and compress it
# We use docker exec to run mysqldump inside the running database container
docker exec $CONTAINER_NAME mysqldump -uroot -p"$DB_PASSWORD" stockflow | gzip > $BACKUP_FILE

echo "Database dumped and compressed successfully to $BACKUP_FILE"

# 3. Upload to AWS S3
# Note: AWS CLI must be installed and configured on the EC2 server
aws s3 cp $BACKUP_FILE $S3_BUCKET/stockflow-backup-$DATE.sql.gz

# 4. Clean up the local file to save disk space
rm $BACKUP_FILE

echo "Backup successfully uploaded to S3!"
