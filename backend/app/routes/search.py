from fastapi import APIRouter, HTTPException, Query
import httpx
from app.config import settings

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("")
async def proxy_youtube_search(q: str, type: str = "video", maxResults: int = 24, videoCategoryId: str = None):
    """
    Proxies requests to the YouTube Search API, protecting our API key on the backend.
    """
    if not settings.YOUTUBE_API_KEY:
        raise HTTPException(status_code=500, detail="YouTube API key not configured on server")

    url = "https://youtube.googleapis.com/youtube/v3/search"
    
    params = {
        "part": "snippet",
        "maxResults": maxResults,
        "q": q,
        "type": type,
        "key": settings.YOUTUBE_API_KEY
    }
    
    if videoCategoryId:
        params["videoCategoryId"] = videoCategoryId

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="YouTube API error")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
