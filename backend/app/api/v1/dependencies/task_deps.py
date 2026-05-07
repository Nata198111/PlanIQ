from app.infrastructure.database.mongodb import get_database
from app.infrastructure.repositories.mongo_task_repository import MongoTaskRepository
from app.ports.repositories.task_repository import TaskRepository


def get_task_repository() -> TaskRepository:
    db = get_database()
    return MongoTaskRepository(db)