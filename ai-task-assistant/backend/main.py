from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from session import get_db
from routes.task import router as tasks_router
from routes.auth import router as auth_router, get_current_user
import crud
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(tasks_router)


@app.get("/")
def root():
    return {"message": "AI Task Assistant backend is running"}


@app.get("/tasks")
def read_tasks(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_tasks(db, current_user.id)


# ---------------- CUSTOM OPENAPI (Adds Authorize Button) ---------------- #
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Task Manager API",
        version="1.0",
        description="API with JWT authentication",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    
    openapi_schema["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi



# Run
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
