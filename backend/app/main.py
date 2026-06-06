"""AgentStore Backend — FastAPI placeholder application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import agents, tools, runs, ratings

app = FastAPI(
    title="AgentStore API",
    description="The App Store for Agents — backend API (skeleton)",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agents.router, prefix="/agents", tags=["agents"])
app.include_router(tools.router, prefix="/tools", tags=["tools"])
app.include_router(runs.router, prefix="/agents", tags=["runs"])
app.include_router(ratings.router, prefix="/agents", tags=["ratings"])
# trending endpoint moved into agents router


@app.get("/")
def root():
    return {
        "name": "AgentStore API",
        "tagline": "The App Store for Agents",
        "status": "skeleton",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
