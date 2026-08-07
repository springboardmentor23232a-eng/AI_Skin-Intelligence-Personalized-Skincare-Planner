import os
import secrets
import requests

from urllib.parse import urlencode

from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse

from sqlalchemy.orm import Session

from dotenv import load_dotenv

from .database import get_db
from . import models
from .auth import create_access_token


load_dotenv()



router = APIRouter(
    tags=["Google OAuth"]
)




@router.get("/auth/google")
def google_login():


    client_id = os.getenv("GOOGLE_CLIENT_ID")

    callback_url = os.getenv("GOOGLE_CALLBACK_URL")



    params = {

        "client_id": client_id,

        "redirect_uri": callback_url,

        "response_type": "code",

        "scope": "openid email profile",

        "state": secrets.token_urlsafe(16),

        "access_type": "offline",

        "prompt": "consent"

    }



    google_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        + urlencode(params)
    )



    return RedirectResponse(
        url=google_url
    )







@router.get("/auth/google/callback")
def google_callback(

    code: str,

    db: Session = Depends(get_db)

):


    token_url = "https://oauth2.googleapis.com/token"



    token_data = {


        "code": code,

        "client_id": os.getenv("GOOGLE_CLIENT_ID"),

        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),

        "redirect_uri": os.getenv("GOOGLE_CALLBACK_URL"),

        "grant_type": "authorization_code"

    }




    token_response = requests.post(

        token_url,

        data=token_data,

        timeout=30

    )



    token_json = token_response.json()



    access_token = token_json.get(
        "access_token"
    )



    if not access_token:


        return {

            "error":"Google authentication failed",

            "details":token_json

        }






    userinfo_response = requests.get(


        "https://www.googleapis.com/oauth2/v2/userinfo",


        headers={

            "Authorization":
            f"Bearer {access_token}"

        }


    )



    google_user = userinfo_response.json()






    db_user = db.query(models.User).filter(

        models.User.email == google_user["email"]

    ).first()






    if db_user is None:



        db_user = models.User(


            name=google_user.get("name"),


            email=google_user.get("email"),


            password="",


            role="USER",


            provider="GOOGLE"

        )



        db.add(db_user)

        db.commit()

        db.refresh(db_user)







    jwt_token = create_access_token(


        {


            "id":db_user.id,


            "email":db_user.email,


            "role":db_user.role


        }


    )







    # Direct redirect to dashboard

    return RedirectResponse(

        url=f"http://127.0.0.1:5500/pages/user-dashboard.html?token={jwt_token}"

    )