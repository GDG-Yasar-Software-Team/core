import asyncio
import random
import smtplib
from dataclasses import dataclass
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings
from app.utils.logger import logger


@dataclass
class SendResult:
    """Result of sending an email."""

    user_id: str
    email: str
    success: bool
    error: str | None = None


class EmailService:
    _unsubscribe_footer_cache: str | None = None

    @classmethod
    def _get_unsubscribe_footer(cls) -> str:
        """Load and cache the unsubscribe footer template."""
        if cls._unsubscribe_footer_cache is None:
            cls._unsubscribe_footer_cache = settings.load_template(
                "unsubscribe_footer.html"
            )
        return cls._unsubscribe_footer_cache

    @classmethod
    async def send_bulk(
        cls,
        recipients: list[tuple[str, str]],  # List of (user_id, email)
        subject: str,
        body_html: str,
        unsubscribe_url_base: str,
        generate_token_func: callable,
        rate_limit_delay: tuple[float, float] | None = None,
    ) -> list[SendResult]:
        """
        Send emails to all recipients with rate limiting.

        Args:
            recipients: List of (user_id, email) tuples
            subject: Email subject
            body_html: HTML body content
            unsubscribe_url_base: Base URL for unsubscribe links
            generate_token_func: Function to generate unsubscribe tokens
            rate_limit_delay: Min and max delay between sends (seconds).
                              Defaults to settings values if None.

        Returns:
            List of SendResult for each recipient
        """
        if not recipients:
            return []

        # Use settings for rate limiting if not provided
        if rate_limit_delay is None:
            rate_limit_delay = (
                settings.RATE_LIMIT_MIN_DELAY,
                settings.RATE_LIMIT_MAX_DELAY,
            )

        results = []

        # Check if body already has unsubscribe placeholder
        has_placeholder = "{{unsubscribe_url}}" in body_html

        # If no placeholder, append footer
        if not has_placeholder:
            body_html = body_html + cls._get_unsubscribe_footer()

        try:
            # Connect to SMTP server (blocking, run in executor)
            loop = asyncio.get_event_loop()
            client = await loop.run_in_executor(None, cls._create_smtp_connection)

            if client is None:
                # Connection failed, mark all as failed
                return [
                    SendResult(
                        user_id=user_id,
                        email=email,
                        success=False,
                        error="SMTP connection failed",
                    )
                    for user_id, email in recipients
                ]

            logger.info("Starting email batch", total_recipients=len(recipients))

            for i, (user_id, email) in enumerate(recipients):
                try:
                    # Generate personalized unsubscribe URL
                    token = generate_token_func(user_id)
                    unsubscribe_url = f"{unsubscribe_url_base}/{token}"

                    # Replace placeholder with actual URL
                    personalized_body = body_html.replace(
                        "{{unsubscribe_url}}", unsubscribe_url
                    )

                    # Send email (blocking, run in executor)
                    await loop.run_in_executor(
                        None,
                        cls._send_single_email,
                        client,
                        email,
                        subject,
                        personalized_body,
                    )

                    results.append(
                        SendResult(user_id=user_id, email=email, success=True)
                    )
                    logger.success("Email sent", recipient=email)

                    # Rate limiting delay (except for last email)
                    if i < len(recipients) - 1:
                        delay = random.uniform(*rate_limit_delay)
                        await asyncio.sleep(delay)

                except smtplib.SMTPException as e:
                    error_msg = str(e)
                    results.append(
                        SendResult(
                            user_id=user_id,
                            email=email,
                            success=False,
                            error=error_msg,
                        )
                    )
                    logger.error(
                        "Failed to send email", recipient=email, error=error_msg
                    )
                except Exception as e:
                    error_msg = str(e)
                    results.append(
                        SendResult(
                            user_id=user_id,
                            email=email,
                            success=False,
                            error=error_msg,
                        )
                    )
                    logger.error(
                        "Unexpected error sending email",
                        recipient=email,
                        error=error_msg,
                    )

            # Close connection
            try:
                client.quit()
            except Exception as e:
                logger.warning(
                    "Failed to close SMTP connection gracefully", error=str(e)
                )

        except Exception as e:
            logger.error("SMTP session error", error=str(e))
            # Mark remaining recipients as failed
            sent_ids = {r.user_id for r in results}
            for user_id, email in recipients:
                if user_id not in sent_ids:
                    results.append(
                        SendResult(
                            user_id=user_id,
                            email=email,
                            success=False,
                            error=str(e),
                        )
                    )

        return results

    @staticmethod
    def _create_smtp_connection() -> smtplib.SMTP | None:
        """Create and authenticate SMTP connection (blocking)."""
        try:
            client = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
            client.starttls()
            client.login(settings.SENDER_ADDRESS, settings.SMTP_PASSWORD)
            logger.info("SMTP connection established")
            return client
        except smtplib.SMTPException as e:
            logger.error("SMTP connection failed", error=str(e))
            return None

    @staticmethod
    def _send_single_email(
        client: smtplib.SMTP,
        recipient: str,
        subject: str,
        body_html: str,
    ) -> None:
        """Send a single email (blocking)."""
        msg = MIMEMultipart()
        msg["From"] = settings.SENDER_ADDRESS
        msg["To"] = recipient
        msg["Subject"] = subject
        msg.attach(MIMEText(body_html, "html"))

        client.sendmail(settings.SENDER_ADDRESS, recipient, msg.as_string())
