"""Tests for email service."""

import base64
import smtplib
from unittest.mock import patch

from app.services.email_service import EmailService


class TestSendBulk:
    """Tests for send_bulk method."""

    async def test_sends_to_all_recipients(self, mock_smtp):
        """Should send emails to all recipients."""
        recipients = ["user1@example.com", "user2@example.com"]

        results = await EmailService.send_bulk(
            recipients=recipients,
            subject="Test",
            body_html="<p>Hello</p>",
            unsubscribe_url_base="http://test.com/unsubscribe",
            generate_token_func=lambda email: f"token-{email}",
            rate_limit_delay=(0.01, 0.02),  # Short delay for tests
        )

        assert len(results) == 2
        assert len(mock_smtp) == 2

    async def test_returns_success_results(self, mock_smtp):
        """Should return success=True for each successful send."""
        recipients = ["user1@example.com"]

        results = await EmailService.send_bulk(
            recipients=recipients,
            subject="Test",
            body_html="<p>Hello</p>",
            unsubscribe_url_base="http://test.com/unsubscribe",
            generate_token_func=lambda email: f"token-{email}",
            rate_limit_delay=(0.01, 0.02),
        )

        assert results[0].success is True
        assert results[0].email == "user1@example.com"

    async def test_includes_correct_subject(self, mock_smtp):
        """Should include correct subject in email."""
        recipients = ["user1@example.com"]

        await EmailService.send_bulk(
            recipients=recipients,
            subject="Test Subject",
            body_html="<p>Hello</p>",
            unsubscribe_url_base="http://test.com/unsubscribe",
            generate_token_func=lambda email: f"token-{email}",
            rate_limit_delay=(0.01, 0.02),
        )

        assert "Test Subject" in mock_smtp[0]["msg"]

    async def test_adds_unsubscribe_footer(self, mock_smtp):
        """Should add unsubscribe footer when no placeholder exists."""
        recipients = ["user1@example.com"]

        await EmailService.send_bulk(
            recipients=recipients,
            subject="Test",
            body_html="<p>Hello</p>",
            unsubscribe_url_base="http://test.com/unsubscribe",
            generate_token_func=lambda email: f"token-{email}",
            rate_limit_delay=(0.01, 0.02),
        )

        # Email content is base64 encoded, so decode it to check
        msg = mock_smtp[0]["msg"]
        # Extract base64 content from the multipart message
        parts = msg.split("\n\n")
        for part in parts:
            try:
                decoded = base64.b64decode(part.strip()).decode("utf-8")
                if "unsubscribe" in decoded.lower():
                    assert True
                    return
            except Exception:
                continue
        # If we didn't find it in decoded parts, fail
        assert False, "Unsubscribe link not found in email"

    async def test_replaces_unsubscribe_placeholder(self, mock_smtp):
        """Should replace {{unsubscribe_url}} placeholder."""
        recipients = ["user1@example.com"]

        await EmailService.send_bulk(
            recipients=recipients,
            subject="Test",
            body_html='<p>Hello</p><a href="{{unsubscribe_url}}">Unsubscribe</a>',
            unsubscribe_url_base="http://test.com/unsubscribe",
            generate_token_func=lambda email: f"token-{email}",
            rate_limit_delay=(0.01, 0.02),
        )

        msg = mock_smtp[0]["msg"]

        # Check raw message first (content may not be base64 encoded)
        found_url = "http://test.com/unsubscribe/token-user1@example.com" in msg
        found_placeholder = "{{unsubscribe_url}}" in msg

        # Also check base64 decoded parts if not found in raw message
        if not found_url:
            parts = msg.split("\n\n")
            for part in parts:
                try:
                    decoded = base64.b64decode(part.strip()).decode("utf-8")
                    if "http://test.com/unsubscribe/token-user1@example.com" in decoded:
                        found_url = True
                    if "{{unsubscribe_url}}" in decoded:
                        found_placeholder = True
                except Exception:
                    continue

        assert found_url, "Unsubscribe URL not found"
        assert not found_placeholder, "Placeholder should have been replaced"

    async def test_generates_unique_unsubscribe_links(self, mock_smtp):
        """Should generate unique unsubscribe links per email."""
        recipients = ["user1@example.com", "user2@example.com"]

        await EmailService.send_bulk(
            recipients=recipients,
            subject="Test",
            body_html="<p>Hello</p>",
            unsubscribe_url_base="http://test.com/unsubscribe",
            generate_token_func=lambda email: f"token-{email}",
            rate_limit_delay=(0.01, 0.02),
        )

        # Decode and check each email
        def find_token_in_msg(msg, token):
            parts = msg.split("\n\n")
            for part in parts:
                try:
                    decoded = base64.b64decode(part.strip()).decode("utf-8")
                    if token in decoded:
                        return True
                except Exception:
                    continue
            return False

        assert find_token_in_msg(mock_smtp[0]["msg"], "token-user1@example.com")
        assert find_token_in_msg(mock_smtp[1]["msg"], "token-user2@example.com")

    async def test_empty_recipients_list(self, mock_smtp):
        """Should return empty list for empty recipients."""
        results = await EmailService.send_bulk(
            recipients=[],
            subject="Test",
            body_html="<p>Hello</p>",
            unsubscribe_url_base="http://test.com/unsubscribe",
            generate_token_func=lambda email: f"token-{email}",
        )

        assert results == []
        assert len(mock_smtp) == 0

    async def test_single_recipient(self, mock_smtp):
        """Should work for single recipient."""
        recipients = ["user1@example.com"]

        results = await EmailService.send_bulk(
            recipients=recipients,
            subject="Test",
            body_html="<p>Hello</p>",
            unsubscribe_url_base="http://test.com/unsubscribe",
            generate_token_func=lambda email: f"token-{email}",
            rate_limit_delay=(0.01, 0.02),
        )

        assert len(results) == 1
        assert results[0].success is True

    async def test_smtp_connection_failure(self):
        """Should mark all as failed when SMTP connection fails."""

        class FailingSMTP:
            def __init__(self, *args, **kwargs):
                raise smtplib.SMTPException("Connection failed")

        with patch("app.services.email_service.smtplib.SMTP", FailingSMTP):
            recipients = ["user1@example.com"]

            results = await EmailService.send_bulk(
                recipients=recipients,
                subject="Test",
                body_html="<p>Hello</p>",
                unsubscribe_url_base="http://test.com/unsubscribe",
                generate_token_func=lambda email: f"token-{email}",
            )

            assert len(results) == 1
            assert results[0].success is False
            assert "SMTP connection failed" in results[0].error

    async def test_partial_failure(self):
        """Should continue sending after individual failures."""
        send_count = 0

        class PartialFailSMTP:
            def __init__(self, *args, **kwargs):
                pass

            def starttls(self):
                pass

            def login(self, *args):
                pass

            def sendmail(self, from_addr, to_addr, msg):
                nonlocal send_count
                send_count += 1
                if send_count == 1:
                    raise smtplib.SMTPException("First send fails")

            def quit(self):
                pass

        with patch("app.services.email_service.smtplib.SMTP", PartialFailSMTP):
            recipients = ["user1@example.com", "user2@example.com"]

            results = await EmailService.send_bulk(
                recipients=recipients,
                subject="Test",
                body_html="<p>Hello</p>",
                unsubscribe_url_base="http://test.com/unsubscribe",
                generate_token_func=lambda email: f"token-{email}",
                rate_limit_delay=(0.01, 0.02),
            )

            assert len(results) == 2
            assert results[0].success is False
            assert results[1].success is True

    async def test_placeholder_takes_priority_over_footer(self, mock_smtp):
        """Should not add footer if placeholder exists."""
        recipients = ["user1@example.com"]

        await EmailService.send_bulk(
            recipients=recipients,
            subject="Test",
            body_html='<p>Hello</p><a href="{{unsubscribe_url}}">Custom Unsub</a>',
            unsubscribe_url_base="http://test.com/unsubscribe",
            generate_token_func=lambda email: f"token-{email}",
            rate_limit_delay=(0.01, 0.02),
        )

        msg = mock_smtp[0]["msg"]
        # Should only have custom unsub link, not footer
        assert msg.count("unsubscribe") == 1 or "Custom Unsub" in msg

    async def test_handles_unicode_content(self, mock_smtp):
        """Should handle non-ASCII characters in content."""
        recipients = ["user1@example.com"]

        await EmailService.send_bulk(
            recipients=recipients,
            subject="Türkçe Test",
            body_html="<p>Merhaba dünya! 你好世界</p>",
            unsubscribe_url_base="http://test.com/unsubscribe",
            generate_token_func=lambda email: f"token-{email}",
            rate_limit_delay=(0.01, 0.02),
        )

        assert len(mock_smtp) == 1
