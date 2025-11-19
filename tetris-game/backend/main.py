from fastapi import FastAPI
from backend.auth import router as auth_router
from backend.score_router import router as score_router

app = FastAPI(
    title="Tetris Game API",
    description="API for Tetris Game Scores and Authentication",
    version="1.0.0"
)

# Include routers
app.include_router(auth_router)
app.include_router(score_router)

# Optional root endpoint
@app.get("/")
def root():
    return {"message": "Tetris Game API is running!"}
