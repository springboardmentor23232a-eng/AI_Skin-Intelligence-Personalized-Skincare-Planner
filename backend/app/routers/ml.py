from fastapi import APIRouter, File, UploadFile, HTTPException

from app.services.ml_service import predict_skin_severity

router = APIRouter(
    prefix="/api/ml",
    tags=["Machine Learning"],
)


@router.post("/predict")
async def predict_skin_image(
    file: UploadFile = File(...)
):
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file."
        )

    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )

        result = predict_skin_severity(image_bytes)

        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )