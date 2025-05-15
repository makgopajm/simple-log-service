FROM public.ecr.aws/lambda/python:3.13

# Copy function code and dependencies
COPY lambda_function.py .
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt --target .

# Set the CMD to your handler
CMD ["lambda_function.lambda_handler"]
