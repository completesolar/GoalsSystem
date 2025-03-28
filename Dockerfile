FROM node:22.14.0 AS frontend-build

WORKDIR /app

COPY Goals-UI/package.json Goals-UI/package-lock.json ./

RUN npm install

COPY Goals-UI/ ./

RUN npm run build

FROM python:3.13.2-slim-bookworm AS backend-build

WORKDIR /app

COPY GoalsApi/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY GoalsApi/ ./

COPY --from=frontend-build /app/dist/goals /app/static

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--port=8000"]