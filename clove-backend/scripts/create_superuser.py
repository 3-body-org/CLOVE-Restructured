# /scripts/create_superuser.py
import asyncio
import getpass
from sqlalchemy.ext.asyncio import AsyncSession
import sys
import os
from datetime import date

# This is a bit of a hack to make the script runnable from the root directory
# It ensures that the app module can be found
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import get_db
from app.crud.user import get_by_email, create_user
from app.utils.security import get_password_hash

async def main():
    """
    Asynchronously creates a superuser by prompting for credentials.
    """
    print("--- Create Superuser ---")
    
    async for session in get_db():
        try:
            email = input("Enter superuser email: ")
            
            # Check if user already exists
            existing_user = await get_by_email(session, email)
            if existing_user:
                print(f"Error: User with email '{email}' already exists.")
                return

            username = input("Enter superuser username: ")
            first_name = input("Enter first name: ")
            last_name = input("Enter last name: ")
            
            # Get birthday
            while True:
                try:
                    birthday_str = input("Enter birthday (YYYY-MM-DD): ")
                    birthday = date.fromisoformat(birthday_str)
                    break
                except ValueError:
                    print("Invalid date format. Please use YYYY-MM-DD (e.g., 1990-01-15)")
            
            password = getpass.getpass("Enter superuser password: ")
            confirm_password = getpass.getpass("Confirm superuser password: ")

            if password != confirm_password:
                print("Error: Passwords do not match.")
                return

            # Create the user with superuser flag
            user = await create_user(
                db=session,
                email=email,
                password_hash=get_password_hash(password),
                first_name=first_name,
                last_name=last_name,
                birthday=birthday,
                # Note: We are now explicitly setting is_superuser
                is_superuser=True,
                bio='Admin user',
                profile_photo_url=''
            )

            # Auto-verify superuser email
            user.email_verified = True
            user.is_active = True
            await session.commit()

            print(f"Superuser '{username}' created successfully with all required data.")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            await session.close()
            break # Ensure we only use one session

if __name__ == "__main__":
    # To run this script, execute `python -m scripts.create_superuser` from the `clove-backend` directory
    asyncio.run(main()) 