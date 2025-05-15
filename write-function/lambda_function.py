import json
import boto3
import uuid
from datetime import datetime
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['LOG_TABLE'])

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }

    if event["httpMethod"] == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"message": "CORS preflight passed"})
        }

    try:
        body = json.loads(event['body'])

        log_entry = {
            "log_id": str(uuid.uuid4()),
            "datetime": datetime.utcnow().isoformat(),
            "severity": body["severity"],
            "message": body["message"]
        }

        table.put_item(Item=log_entry)

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"message": "Log saved", "log_id": log_entry["log_id"]})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)})
        }
