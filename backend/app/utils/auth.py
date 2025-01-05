import jwt
import httpx
import os
from dotenv import load_dotenv
from fastapi import Request, HTTPException, Depends

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Function to fetch the public key from Supabase JWKs endpoint
async def get_public_key():
    print(f"DEBUG: Requesting JWKs from URL={SUPABASE_URL}/auth/v1/keys")
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/auth/v1/keys",
            headers={
                "apikey": SUPABASE_KEY,  # Pass the service_role or anon key
                "Authorization": f"Bearer {SUPABASE_KEY}"  # Some setups may require this
            },
        )
        print(f"DEBUG: Response status={response.status_code}")
        print(f"DEBUG: Response content={response.text}")

        if response.status_code == 200:
            jwks = response.json()
            print("DEBUG: JWKs received:", jwks)
            # Assuming the keys have 'public_key' (check structure in response)
            public_key = jwks[0].get("public_key")
            return public_key
        else:
            raise HTTPException(status_code=500, detail="Unable to fetch public key from Supabase")


# Function to validate the JWT token
async def validate_token(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Authorization token missing")

    # Fetch public key from Supabase
    public_key = await get_public_key()
    if public_key:
        try:
            # Decode JWT token using the public key
            decoded_token = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],  # Ensure this matches the algorithm used by Supabase
                audience="authenticated",  # Optional: You can validate the audience
                issuer=f"{SUPABASE_URL}/auth/v1",  # Optional: Validate the issuer
            )
            return decoded_token  # Return decoded token if valid
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
    else:
        raise HTTPException(status_code=500, detail="Public key not available")