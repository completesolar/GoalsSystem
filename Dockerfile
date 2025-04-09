FROM node:22.14.0 AS frontend-build

WORKDIR /app

COPY frontend/package.json ./

RUN npm install

COPY frontend/ ./

RUN npm run build

FROM python:3.13.2-slim-bookworm AS backend-build

WORKDIR /app

COPY backend/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

COPY --from=frontend-build /app/dist/complete-solar-fe/browser /app/static

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--port=8000"]