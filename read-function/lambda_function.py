import json
import boto3
import os
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['LOG_TABLE'])

# CORS headers
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "https://logging-service.urbanversatile.com",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json"
}

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def lambda_handler(event, context):
    method = event.get("httpMethod", "")

    # Handle preflight CORS
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "CORS preflight OK"})
        }

    try:
        # Optional: You can log the user identity here if needed
        # user = event['requestContext']['authorizer']['claims']['email']

        # Scan logs
        response = table.scan()
        items = response.get('Items', [])

        # Sort and limit to 100 logs
        sorted_items = sorted(items, key=lambda x: x.get('datetime', ''), reverse=True)
        latest_logs = sorted_items[:100]

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps(latest_logs, default=decimal_default)
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)})
        }
