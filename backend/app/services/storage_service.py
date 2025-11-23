"""R2 Storage Service for handling video uploads and retrieval."""

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from typing import BinaryIO, Optional
from pathlib import Path
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class R2StorageService:
    """Service for interacting with Cloudflare R2 storage."""

    def __init__(self):
        """Initialize the R2 storage client."""
        # Create S3 client configured for R2
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
        )
        self.bucket_name = settings.R2_BUCKET_NAME
        self.public_url = settings.R2_PUBLIC_URL

    def upload_file(
        self, file_obj: BinaryIO, filename: str, content_type: Optional[str] = None
    ) -> str:
        """
        Upload a file to R2 bucket.

        Args:
            file_obj: File-like object to upload
            filename: Name to store the file as in R2
            content_type: MIME type of the file (optional)

        Returns:
            Public URL of the uploaded file

        Raises:
            Exception: If upload fails
        """
        try:
            extra_args = {}
            if content_type:
                extra_args["ContentType"] = content_type

            # Upload file to R2
            self.s3_client.upload_fileobj(
                file_obj, self.bucket_name, filename, ExtraArgs=extra_args
            )

            # Return public URL (remove trailing slash from public_url if present)
            base_url = self.public_url.rstrip('/')
            public_url = f"{base_url}/{filename}"
            logger.info(f"Successfully uploaded {filename} to R2")
            return public_url

        except ClientError as e:
            logger.error(f"Failed to upload {filename} to R2: {str(e)}")
            raise Exception(f"Failed to upload file to R2: {str(e)}")

    def delete_file(self, filename: str) -> bool:
        """
        Delete a file from R2 bucket.

        Args:
            filename: Name of the file to delete

        Returns:
            True if deletion was successful

        Raises:
            Exception: If deletion fails
        """
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=filename)
            logger.info(f"Successfully deleted {filename} from R2")
            return True

        except ClientError as e:
            logger.error(f"Failed to delete {filename} from R2: {str(e)}")
            raise Exception(f"Failed to delete file from R2: {str(e)}")

    def get_file_url(self, filename: str) -> str:
        """
        Get the public URL for a file in R2.

        Args:
            filename: Name of the file

        Returns:
            Public URL of the file
        """
        base_url = self.public_url.rstrip('/')
        return f"{base_url}/{filename}"

    def file_exists(self, filename: str) -> bool:
        """
        Check if a file exists in R2 bucket.

        Args:
            filename: Name of the file to check

        Returns:
            True if file exists, False otherwise
        """
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=filename)
            return True
        except ClientError:
            return False


# Global storage service instance
storage_service = R2StorageService()
