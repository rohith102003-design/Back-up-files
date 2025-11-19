from backend.hashing import Hash

def hash_password(password: str):
    return Hash.bcrypt(password)

def verify_password(plain_password: str, hashed_password: str):
    return Hash.verify(hashed_password, plain_password)
