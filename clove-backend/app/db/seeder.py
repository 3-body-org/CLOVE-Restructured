from typing import List, Dict, Any
import json
import os
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Topic, Subtopic, Challenge, Lesson, AssessmentQuestion, User
from app.utils.security import get_password_hash
from app.crud.user import init_user_data
import logging
import asyncio
from app.db.session import get_db
import subprocess
import sys

logger = logging.getLogger(__name__)

class DatabaseSeeder:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.base_path = Path(__file__).parent.parent / 'data' / 'seed'
        self.topics: List[Dict[str, Any]] = []
        self.subtopics: List[Dict[str, Any]] = []
        self.challenges: List[Dict[str, Any]] = []
        self.lessons: List[Dict[str, Any]] = []
        self.assessment_questions: List[Dict[str, Any]] = []
        self.users: List[Dict[str, Any]] = []

    async def load_json_data(self):
        """Load all JSON seed data files"""
        try:
            # Ensure seed data directory exists
            self.base_path.mkdir(parents=True, exist_ok=True)
            
            # Load each data file
            self.topics = self._load_json_file('topics.json')
            self.subtopics = self._load_json_file('subtopics.json')
            self.challenges = self._load_json_file('challenges.json')
            self.lessons = self._load_json_file('lessons.json')
            self.assessment_questions = self._load_json_file('assessment_questions.json')
            
            logger.info("Successfully loaded all seed data files")
        except Exception as e:
            logger.error(f"Error loading seed data: {str(e)}")
            raise

    def _load_json_file(self, filename: str) -> List[Dict[str, Any]]:
        """Load a single JSON file"""
        file_path = self.base_path / filename
        if not file_path.exists():
            logger.warning(f"Seed file {filename} not found. Creating empty file.")
            self._create_empty_seed_file(filename)
            return []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _create_empty_seed_file(self, filename: str):
        """Create an empty seed file with structure"""
        file_path = self.base_path / filename
        empty_data = []
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(empty_data, f, indent=2)

    async def fix_sequences(self):
        """Fix PostgreSQL sequences after seeding with explicit IDs"""
        try:
            # Tables that were seeded with explicit IDs
            tables_to_fix = [
                ('users', 'id'),
                ('topics', 'topic_id'),
                ('subtopics', 'subtopic_id'),
                ('assessment_questions', 'id'),
                ('challenges', 'id'),
                ('lessons', 'id'),
                ('statistics', 'id')
            ]
            
            for table_name, column_name in tables_to_fix:
                # Get the sequence name
                sequence_name = f"{table_name}_{column_name}_seq"
                
                # Update the sequence to the max value + 1
                await self.session.execute(text(f"""
                    SELECT setval('{sequence_name}', COALESCE((SELECT MAX({column_name}) FROM {table_name}), 0) + 1, false);
                """))
            
            logger.info("Successfully fixed sequences for seeded tables")
        except Exception as e:
            logger.error(f"Error fixing sequences: {str(e)}")
            raise

    async def seed_database(self):
        """Main seeding function"""
        try:
            await self.load_json_data()
            
            # Seed in correct order to maintain relationships
            await self._seed_topics()
            await self._seed_subtopics()
            await self._seed_assessment_questions()
            await self.session.flush()
            await self._seed_lessons()
            await self._seed_challenges()
            await self._seed_users()
            
            # Fix sequences after seeding is complete
            await self.fix_sequences()
            
            await self.session.commit()
            logger.info("Database seeding completed successfully")
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Error seeding database: {str(e)}")
            raise

    async def _seed_users(self):
        """Seed users table with predefined accounts."""
        # Note: In a real production app, passwords should not be hardcoded.
        # This is for development and testing purposes.
        hashed_pw = get_password_hash("dangalngbayan")
        
        # 1. Create Superuser (commented out - use create_superuser.py instead)
        # users_to_seed = [
        #     User(id=1, username="superuser", email="superuser@clove.com", password_hash=hashed_pw, is_adaptive=True, is_superuser=True)
        # ]
        
        users_to_seed = []
        
        # 2. Create Adaptive Users (23)
        for i in range(1, 24): # 1 to 23
            users_to_seed.append(
                User(id=i, username=f"adaptive{i}", email=f"adaptive{i}@clove.com", password_hash=hashed_pw, is_adaptive=True)
            )
            
        # 3. Create Non-Adaptive Users (22)
        for i in range(1, 23): # 1 to 22
            users_to_seed.append(
                User(id=i+23, username=f"nonadaptive{i}", email=f"nonadaptive{i}@clove.com", password_hash=hashed_pw, is_adaptive=False)
            )

        for user in users_to_seed:
            await self.session.merge(user)
        
        await self.session.flush()
        logger.info(f"Seeded {len(users_to_seed)} users (inserted or updated)")
        
        # Initialize user data for all seeded users (since merge() doesn't trigger create_user())
        for user in users_to_seed:
            await init_user_data(self.session, user.id)
        
        logger.info("Initialized user data (UserTopics, UserSubtopics, Pre/PostAssessments, Statistics) for all users")

    async def _seed_topics(self):
        """Seed topics table"""
        for topic_data in self.topics:
            topic = Topic(**topic_data)
            await self.session.merge(topic)  # Upsert
        await self.session.flush()
        logger.info(f"Seeded {len(self.topics)} topics (inserted or updated)")

    async def _seed_subtopics(self):
        """Seed subtopics table"""
        for subtopic_data in self.subtopics:
            subtopic = Subtopic(**subtopic_data)
            await self.session.merge(subtopic)  # Upsert
        await self.session.flush()
        logger.info(f"Seeded {len(self.subtopics)} subtopics (inserted or updated)")

    async def _seed_lessons(self):
        """Seed lessons table"""
        for lesson_data in self.lessons:
            lesson = Lesson(**lesson_data)
            await self.session.merge(lesson)  # Upsert
        await self.session.flush()
        logger.info(f"Seeded {len(self.lessons)} lessons (inserted or updated)")

    async def _seed_challenges(self):
        """Seed challenges table"""
        for challenge_data in self.challenges:
            challenge = Challenge(**challenge_data)
            await self.session.merge(challenge)  # Upsert
        await self.session.flush()
        logger.info(f"Seeded {len(self.challenges)} challenges (inserted or updated)")

    async def _seed_assessment_questions(self):
        """Seed assessment questions table"""
        for question_data in self.assessment_questions:
            question = AssessmentQuestion(**question_data)
            await self.session.merge(question)  # Upsert
        await self.session.flush()
        logger.info(f"Seeded {len(self.assessment_questions)} assessment questions (inserted or updated)")

    @staticmethod
    async def needs_seeding(session: AsyncSession) -> bool:
        """Check if database needs seeding"""
        try:
            result = await session.execute(text("SELECT COUNT(*) FROM topics"))
            count = result.scalar()
            return count == 0
        except Exception as e:
            logger.warning(f"Could not check seeding status: {str(e)}")
            # If topics table doesn't exist yet (e.g., initial migration), it needs seeding.
            return True

async def deploy():
    """Complete deployment process including migrations and seeding"""
    try:
        # Step 1: Run Alembic migrations
        logger.info("Running database migrations...")
        result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"Migration failed: {result.stderr}")
            sys.exit(1)
        logger.info("Migrations completed successfully")

        # Step 2: Check and perform seeding if needed
        async for session in get_db():
            if await DatabaseSeeder.needs_seeding(session):
                logger.info("Starting database seeding...")
                logger.warning("NOTE: Superuser should be created separately using 'scripts/create_superuser.py'")
                seeder = DatabaseSeeder(session)
                await seeder.seed_database()
                logger.info("Seeding completed successfully")
            else:
                logger.info("Database already seeded, skipping...")
            break

        logger.info("Deployment completed successfully!")

    except Exception as e:
        logger.error(f"Deployment failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    # Run deployment
    asyncio.run(deploy()) 