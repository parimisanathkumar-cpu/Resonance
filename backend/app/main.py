from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import search, favorites, playlists, auth

# Create DB tables (in production use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Resonance API")

# Setup CORS so our React frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow any origin (Vite, Capacitor, Android)
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(search.router)
app.include_router(favorites.router)
app.include_router(playlists.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Resonance API"}
