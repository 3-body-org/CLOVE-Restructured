import secrets

# Generate a secure random key
secure_key = secrets.token_hex(32)
print("\nGenerated Secure JWT Key:")
print("-" * 50)
print(secure_key)
print("-" * 50)
print("\nCopy this key and update your .env file's JWT_SECRET_KEY with this value.") 