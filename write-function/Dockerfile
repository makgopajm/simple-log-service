FROM public.ecr.aws/lambda/python:3.12

# Set working directory to /var/task (Lambda default)
WORKDIR /var/task

# Copy function code and dependency list
COPY lambda_function.py .
COPY requirements.txt .

# Install dependencies to current directory
RUN pip install --no-cache-dir -r requirements.txt --target .

# Set the CMD to your handler
CMD ["lambda_function.lambda_handler"]
