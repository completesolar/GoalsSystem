from fastapi import FastAPI
from controllers.goals import router
from database import engine
from models.models import Base
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Initialize FastAPI app
app = FastAPI(
    title="Goals API",
    description="This is a custom API for my project, with Swagger integration.",
    version="1.0.0"
)

app.mount("/ui-goals", StaticFiles(directory="/app/static", html=True), name="static")

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:4200",
    "http://localhost:8000/goals",
    "https://dev-goals.completesolar.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Create database tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Goals project!"}
