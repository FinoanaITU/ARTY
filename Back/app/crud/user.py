from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_password_hash, verify_password


class UserCRUD:
    def get_by_email(self, db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    def authenticate(self, db: Session, email: str, password: str):
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, str(user.password_hash)):
            return None
        return user

    def create(self, db: Session, obj_in):
        db_obj = User(
            email=obj_in.email,
            username=obj_in.username,
            password_hash=get_password_hash(obj_in.password),
            first_name=obj_in.first_name,
            last_name=obj_in.last_name
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


# Create instance for import
user_crud = UserCRUD() 