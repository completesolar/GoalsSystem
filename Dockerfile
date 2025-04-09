FROM node:22.14.0 AS frontend-build

WORKDIR /app

COPY FRONTEND/package.json ./

RUN npm install

COPY FRONTEND/ ./

RUN npm run build

FROM python:3.13.2-slim-bookworm AS backend-build

WORKDIR /app

COPY Backend-Goals/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY Backend-Goals/ ./

COPY --from=frontend-build /app/dist/complete-solar-fe/browser /app/static

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--port=8000"]