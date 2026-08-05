from fastapi import Request
from fastapi.responses import JSONResponse
from app.logging_config import logger

class BaseAPIException(Exception):
    """Base exception class for all custom API errors."""
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(message)

class DuplicateEmailException(BaseAPIException):
    def __init__(self, message: str = "An account with this email address already exists"):
        super().__init__(status_code=400, message=message)

class InvalidCredentialsException(BaseAPIException):
    def __init__(self, message: str = "Incorrect email address or password"):
        super().__init__(status_code=401, message=message)

class UserNotFoundException(BaseAPIException):
    def __init__(self, message: str = "User profile not found"):
        super().__init__(status_code=404, message=message)

class PermissionDeniedException(BaseAPIException):
    def __init__(self, message: str = "Permission denied. Insufficient credentials."):
        super().__init__(status_code=403, message=message)

class InvalidTokenException(BaseAPIException):
    def __init__(self, message: str = "Invalid or expired credentials session token"):
        super().__init__(status_code=401, message=message)

def register_exception_handlers(app):
    """Registers exception hooks on the FastAPI app instance."""
    @app.exception_handler(BaseAPIException)
    async def base_api_exception_handler(request: Request, exc: BaseAPIException):
        logger.warning(f"API Warning [{exc.status_code}] on {request.url.path}: {exc.message}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "message": exc.message}
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "An unexpected server error occurred."}
        )
