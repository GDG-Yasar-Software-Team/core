from app.models.user import SubscribedEmailsResponse, User, UserResponse
from app.repositories.user_repository import UserRepository
from app.utils.email import normalize_email
from app.utils.logger import logger


class UserService:
    @classmethod
    async def create_user(cls, data: User) -> str:
        """Create a new user.

        Auto-detects is_yasar_student from email domain if not provided.
        """
        normalized_email = normalize_email(str(data.email))
        data = data.model_copy(update={"email": normalized_email})

        # Auto-detect Yasar student from email domain if not explicitly set
        if data.is_yasar_student is None and normalized_email.endswith(
            "@stu.yasar.edu.tr"
        ):
            data = User(
                email=normalized_email,
                name=data.name,
                is_yasar_student=True,
                section=data.section,
                grade=data.grade,
                turkish_identity_number=data.turkish_identity_number,
                is_subscribed=data.is_subscribed,
            )
            logger.info("Auto-detected Yasar student", email=data.email)

        return await UserRepository.create(data)

    @classmethod
    async def update_user(cls, email: str, update: User) -> UserResponse:
        """Update a user by email. Only updates non-None fields."""
        normalized_email = normalize_email(email)
        normalized_update = update.model_copy(
            update={"email": normalize_email(str(update.email))}
        )
        db_user = await UserRepository.update(normalized_email, normalized_update)
        return UserResponse.from_db(db_user)

    @classmethod
    async def get_user_by_email(cls, email: str) -> UserResponse | None:
        """Get a user by email."""
        db_user = await UserRepository.get_by_email(normalize_email(email))
        if db_user is None:
            return None
        return UserResponse.from_db(db_user)

    @classmethod
    async def get_subscribed_emails(cls) -> SubscribedEmailsResponse:
        """Get all subscribed users' emails."""
        emails = await UserRepository.get_subscribed_emails()
        return SubscribedEmailsResponse(emails=emails, count=len(emails))

    @classmethod
    async def record_form_submission(cls, email: str, form_id: str) -> None:
        """Record a form submission for a user."""
        await UserRepository.add_submitted_form(normalize_email(email), form_id)

    @classmethod
    async def record_mail_received(cls, email: str, mail_id: str) -> None:
        """Record a mail received for a user."""
        await UserRepository.add_received_mail(normalize_email(email), mail_id)
