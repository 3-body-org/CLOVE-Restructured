# models.py
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    """User model representing a registered user in the database.

    Attributes:
        id (int): Primary key
        username (str): Unique username
        email (str): User's email address
        hashed_password (str): Securely stored password hash
    """

    __tablename__ = "users"
