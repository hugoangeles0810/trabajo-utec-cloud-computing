# Start from AWS Lambda Python 3.9 base image
FROM public.ecr.aws/lambda/python:3.9

# Copy requirements and install dependencies
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install postgresql-devel and gcc (required for psycopg2 compilation)
RUN yum install -y gcc postgresql-devel

# Install Python dependencies
RUN pip3 install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

# Copy the Lambda function code
COPY handlers/ ${LAMBDA_TASK_ROOT}/handlers/
COPY db_utils.py ${LAMBDA_TASK_ROOT}/

# Set the CMD to your handler
CMD ["handlers/categories_list.lambda_handler"]