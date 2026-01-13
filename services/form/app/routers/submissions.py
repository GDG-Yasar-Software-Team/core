from fastapi import APIRouter, HTTPException
from app.models.submission import SubmissionCreate, SubmissionResponse
from app.services.submission_service import create_submission

router = APIRouter()

@router.post("/", response_model=SubmissionResponse)
async def create_new_submission(submission: SubmissionCreate):
    
    try:
        return await create_submission(submission)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))