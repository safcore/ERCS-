# ==============================================================================
# ERCS Backend Dockerfile
# Single-stage build matching 04-docker/README.md methodology
# Student Roll No: 124BTCS1031 | Course: DevSecOps Lab CIAP
# ==============================================================================

FROM python:3.12-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

ENV PORT=5000
EXPOSE 5000

# Simple Python startup command matching faculty lab instructions
CMD ["python3", "app.py"]