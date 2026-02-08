FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy pyproject.toml and poetry.lock
COPY pyproject.toml poetry.lock* /app/

# Install poetry
RUN pip install --no-cache-dir poetry

# Install dependencies
RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi --no-root

# Copy application code
COPY . /app/

# Expose port
EXPOSE 5000

# Run the application
CMD ["sh", "-c", "cd /app && poetry run python api/run.py"]