from fastapi import HTTPException


class AppError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message


def create_error(status_code: int, message: str) -> AppError:
    return AppError(status_code, message)
