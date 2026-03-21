import boto3
import os
from dotenv import load_dotenv

load_dotenv()

def upload_pdf_to_s3(file_obj, filename):
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_S3_REGION_NAME")
    )
    
    bucket_name = os.getenv("AWS_STORAGE_BUCKET_NAME")
    
    try:
        s3_client.upload_fileobj(
            file_obj,
            bucket_name,
            filename,
            ExtraArgs={'ContentType': 'application/pdf'}
        )
        
        # Construct the URL manually based on your bucket's public path
        url = f"https://{bucket_name}.s3.{os.getenv('AWS_S3_REGION_NAME')}.amazonaws.com/{filename}"
        return url
    except Exception as e:
        print(f"S3 Upload Error: {e}")
        return None