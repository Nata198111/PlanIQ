
class AppError(Exception):
    """Базова помилка застосунку."""
    def __init__(self, message: str, code: str = "APP_ERROR"):
        self.message = message
        self.code = code
        super().__init__(message)


class AlreadyExistsError(AppError):
    """Ресурс вже існує."""
    def __init__(self, message: str = "Already exists"):
        super().__init__(message, code="ALREADY_EXISTS")


class NotFoundError(AppError):
    """Ресурс не знайдено."""
    def __init__(self, message: str = "Not found"):
        super().__init__(message, code="NOT_FOUND")


class AuthenticationError(AppError):
    """Помилка автентифікації."""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, code="AUTH_ERROR")


class PermissionError(AppError):
    """Доступ заборонено."""
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message, code="PERMISSION_DENIED")