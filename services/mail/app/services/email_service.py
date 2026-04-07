import asyncio
import random
import smtplib
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings
from app.utils.logger import logger

SMTP_TIMEOUT = 30


@dataclass
class SendResult:
    """Result of sending an email."""

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
        recipients: list[str],
        subject: str,
        body_html: str,
        unsubscribe_url_base: str,
        generate_token_func: Callable[[str], str],
        rate_limit_delay: tuple[float, float] | None = None,
        progress_callback: Callable[[int, int], Awaitable[None]] | None = None,
    ) -> list[SendResult]:
        """
        Send emails to all recipients with rate limiting.

        Args:
            recipients: List of email addresses
            subject: Email subject
            body_html: HTML body content
            unsubscribe_url_base: Base URL for unsubscribe links
            generate_token_func: Function to generate unsubscribe tokens (takes email)
            rate_limit_delay: Min and max delay between sends (seconds).
                              Defaults to settings values if None.
            progress_callback: Optional async callback(sent_count, failed_count)
                               called after each email for progress tracking.

        Returns:
            List of SendResult for each recipient
        """
        if not recipients:
            return []

        if rate_limit_delay is None:
            rate_limit_delay = (
                settings.RATE_LIMIT_MIN_DELAY,
                settings.RATE_LIMIT_MAX_DELAY,
            )

        results: list[SendResult] = []

        has_placeholder = "{{unsubscribe_url}}" in body_html
        if not has_placeholder:
            body_html = body_html + cls._get_unsubscribe_footer()

        try:
            loop = asyncio.get_running_loop()
            client = await loop.run_in_executor(None, cls._create_smtp_connection)

            if client is None:
                return [
                    SendResult(
                        email=email,
                        success=False,
                        error="SMTP connection failed",
                    )
                    for email in recipients
                ]

            logger.info("Starting email batch", total_recipients=len(recipients))

            sent_so_far = 0
            failed_so_far = 0

            for i, email in enumerate(recipients):
                try:
                    token = generate_token_func(email)
                    unsubscribe_url = f"{unsubscribe_url_base}/{token}"

                    personalized_body = body_html.replace(
                        "{{unsubscribe_url}}", unsubscribe_url
                    )

                    try:
                        await loop.run_in_executor(
                            None,
                            cls._send_single_email,
                            client,
                            email,
                            subject,
                            personalized_body,
                            unsubscribe_url,
                        )
                    except smtplib.SMTPServerDisconnected:
                        logger.warning(
                            "SMTP connection lost, reconnecting",
                            recipient=email,
                        )
                        client = await loop.run_in_executor(
                            None, cls._create_smtp_connection
                        )
                        if client is None:
                            raise smtplib.SMTPException("SMTP reconnection failed")
                        await loop.run_in_executor(
                            None,
                            cls._send_single_email,
                            client,
                            email,
                            subject,
                            personalized_body,
                            unsubscribe_url,
                        )

                    results.append(SendResult(email=email, success=True))
                    sent_so_far += 1
                    logger.success("Email sent", recipient=email)

                except smtplib.SMTPException as e:
                    error_msg = str(e)
                    results.append(
                        SendResult(email=email, success=False, error=error_msg)
                    )
                    failed_so_far += 1
                    logger.error(
                        "Failed to send email", recipient=email, error=error_msg
                    )
                except Exception as e:
                    error_msg = str(e)
                    results.append(
                        SendResult(email=email, success=False, error=error_msg)
                    )
                    failed_so_far += 1
                    logger.error(
                        "Unexpected error sending email",
                        recipient=email,
                        error=error_msg,
                    )

                if progress_callback:
                    await progress_callback(sent_so_far, failed_so_far)

                if i < len(recipients) - 1:
                    delay = random.uniform(*rate_limit_delay)
                    await asyncio.sleep(delay)

            try:
                client.quit()
            except Exception as e:
                logger.warning(
                    "Failed to close SMTP connection gracefully", error=str(e)
                )

        except Exception as e:
            logger.error("SMTP session error", error=str(e))
            sent_emails = {r.email for r in results}
            for email in recipients:
                if email not in sent_emails:
                    results.append(
                        SendResult(
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
            client = smtplib.SMTP(
                settings.SMTP_SERVER, settings.SMTP_PORT, timeout=SMTP_TIMEOUT
            )
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
        unsubscribe_url: str = "",
    ) -> None:
        """Send a single email (blocking)."""
        msg = MIMEMultipart()
        msg["From"] = settings.SENDER_ADDRESS
        msg["To"] = recipient
        msg["Subject"] = subject

        if unsubscribe_url:
            msg["List-Unsubscribe"] = f"<{unsubscribe_url}>"
            msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"

        msg.attach(MIMEText(body_html, "html"))

        client.sendmail(settings.SENDER_ADDRESS, recipient, msg.as_string())

    @classmethod
    async def send_test(
        cls,
        recipients: list[str],
        subject: str,
        body_html: str,
    ) -> list[SendResult]:
        """
        Send test emails directly to the given recipients.

        Does NOT inject unsubscribe links, does NOT write to DB,
        does NOT call user service. Used only for admin preview/testing.

        Args:
            recipients: List of email addresses (max 10)
            subject: Email subject
            body_html: HTML body content

        Returns:
            List of SendResult for each recipient
        """
        if not recipients:
            return []

        results: list[SendResult] = []

        try:
            loop = asyncio.get_running_loop()
            client = await loop.run_in_executor(None, cls._create_smtp_connection)

            if client is None:
                return [
                    SendResult(
                        email=email,
                        success=False,
                        error="SMTP connection failed",
                    )
                    for email in recipients
                ]

            logger.info("Starting test email batch", total_recipients=len(recipients))

            for i, email in enumerate(recipients):
                try:
                    await loop.run_in_executor(
                        None,
                        cls._send_single_email,
                        client,
                        email,
                        f"[TEST] {subject}",
                        body_html,
                        "",
                    )
                    results.append(SendResult(email=email, success=True))
                    logger.success("Test email sent", recipient=email)
                except smtplib.SMTPException as e:
                    error_msg = str(e)
                    results.append(
                        SendResult(email=email, success=False, error=error_msg)
                    )
                    logger.error(
                        "Failed to send test email",
                        recipient=email,
                        error=error_msg,
                    )
                except Exception as e:
                    error_msg = str(e)
                    results.append(
                        SendResult(email=email, success=False, error=error_msg)
                    )
                    logger.error(
                        "Unexpected error sending test email",
                        recipient=email,
                        error=error_msg,
                    )

                if i < len(recipients) - 1:
                    await asyncio.sleep(0.5)

            try:
                client.quit()
            except Exception as e:
                logger.warning(
                    "Failed to close SMTP connection gracefully", error=str(e)
                )

        except Exception as e:
            logger.error("SMTP session error during test send", error=str(e))
            sent_emails = {r.email for r in results}
            for email in recipients:
                if email not in sent_emails:
                    results.append(
                        SendResult(
                            email=email,
                            success=False,
                            error=str(e),
                        )
                    )

        return results
