import os
from dotenv import load_dotenv

# Load root .env file if available, or local environment
root_env = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
if os.path.exists(root_env):
    load_dotenv(root_env)
else:
    load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "7410")
DB_NAME = os.getenv("DB_NAME", "ai_skincare")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "asdfghjkl")

# SQLAlchemy connection string
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "ai_skincare_super_secret_jwt_key_2026_module1")
JWT_ALGORITHM = "HS256"
