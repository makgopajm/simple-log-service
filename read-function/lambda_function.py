import json
import boto3
import os
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['LOG_TABLE'])

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    }

    try:
        response = table.scan()
        items = response.get('Items', [])

        sorted_items = sorted(items, key=lambda x: x.get('datetime', ''), reverse=True)
        latest_logs = sorted_items[:100]

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(latest_logs, default=decimal_default)
        }

    except Exception as e:
        print(f"Error: {e}")  # Log to CloudWatch
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)})
        }

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")