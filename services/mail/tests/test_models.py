"""Tests for Pydantic models."""

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.models.campaign import (
    CampaignCreate,
    CampaignUpdate,
    ScheduledSend,
)


class TestCampaignCreate:
    """Tests for CampaignCreate model validation."""

    def test_validates_subject_min_length(self):
        """Should reject empty subject."""
        with pytest.raises(ValidationError):
            CampaignCreate(subject="", body_html="<p>Content</p>")

    def test_validates_subject_max_length(self):
        """Should reject subject over 200 characters."""
        with pytest.raises(ValidationError):
            CampaignCreate(subject="x" * 201, body_html="<p>Content</p>")

    def test_validates_body_html_not_empty(self):
        """Should reject empty body_html."""
        with pytest.raises(ValidationError):
            CampaignCreate(subject="Test", body_html="")

    def test_accepts_valid_campaign(self):
        """Should accept valid campaign data."""
        campaign = CampaignCreate(
            subject="Valid Subject",
            body_html="<p>Valid content</p>",
        )
        assert campaign.subject == "Valid Subject"

    def test_accepts_scheduled_sends(self):
        """Should accept scheduled_sends list."""
        campaign = CampaignCreate(
            subject="Test",
            body_html="<p>Content</p>",
            scheduled_sends=[
                ScheduledSend(time=datetime(2025, 1, 20, 10, 0, 0)),
            ],
        )
        assert len(campaign.scheduled_sends) == 1


class TestScheduledSend:
    """Tests for ScheduledSend model validation."""

    def test_validates_time_required(self):
        """Should require time field."""
        with pytest.raises(ValidationError):
            ScheduledSend()

    def test_optional_subject(self):
        """Should allow None subject."""
        send = ScheduledSend(time=datetime(2025, 1, 20, 10, 0, 0))
        assert send.subject is None

    def test_accepts_custom_subject(self):
        """Should accept custom subject."""
        send = ScheduledSend(
            time=datetime(2025, 1, 20, 10, 0, 0),
            subject="Custom Subject",
        )
        assert send.subject == "Custom Subject"

    def test_normalizes_naive_time_to_utc(self):
        """Should normalize naive datetime values to UTC."""
        send = ScheduledSend(time=datetime(2025, 1, 20, 10, 0, 0))

        assert send.time.tzinfo is not None
        assert send.time.tzinfo == timezone.utc

    def test_normalizes_aware_time_to_utc(self):
        """Should normalize timezone-aware datetime values to UTC."""
        send = ScheduledSend(time=datetime.fromisoformat("2025-01-20T13:00:00+03:00"))

        assert send.time == datetime(2025, 1, 20, 10, 0, 0, tzinfo=timezone.utc)


class TestCampaignUpdate:
    """Tests for CampaignUpdate model validation."""

    def test_all_fields_optional(self):
        """Should allow empty update."""
        update = CampaignUpdate()
        assert update.subject is None
        assert update.body_html is None

    def test_partial_update(self):
        """Should allow partial update."""
        update = CampaignUpdate(subject="New Subject Only")
        assert update.subject == "New Subject Only"
        assert update.body_html is None

    def test_validates_subject_when_provided(self):
        """Should validate subject if provided."""
        with pytest.raises(ValidationError):
            CampaignUpdate(subject="")
