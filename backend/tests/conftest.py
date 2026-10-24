import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.main import app as fastapi_app
from app.db.base import Base
from app.db.session import get_db
from app.core.security import hash_password, create_access_token
from app.models.user import User, UserProfile
import app.models  # noqa

# Test in-memory SQLite database
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as test_client:
        yield test_client
    fastapi_app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session: Session) -> User:
    user = User(
        username="test_patient",
        email="patient@test.com",
        hashed_password=hash_password("password123"),
        preferred_language="English",
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()

    profile = UserProfile(
        user_id=user.id,
        full_name="Test Patient",
        age=30,
        height_cm=175.0,
        weight_kg=70.0,
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def other_user(db_session: Session) -> User:
    user = User(
        username="other_patient",
        email="other@test.com",
        hashed_password=hash_password("password123"),
        preferred_language="English",
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()

    profile = UserProfile(user_id=user.id, full_name="Other Patient")
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def other_auth_headers(other_user: User) -> dict:
    token = create_access_token(other_user.id)
    return {"Authorization": f"Bearer {token}"}
