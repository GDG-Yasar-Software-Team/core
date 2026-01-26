"""Tests for campaign service."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bson import ObjectId

from app.models.campaign import (
    CampaignUpdate,
)
from app.repositories.campaign_repository import CampaignNotFoundError
from app.services.campaign_service import CampaignService
from app.services.email_service import SendResult
from tests.conftest import create_async_cursor


class TestCreateCampaign:
    """Tests for campaign creation."""

    async def test_stores_html_content(self, mock_mongodb, sample_campaign_data):
        """Should store body_html in database."""
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId())
        )

        await CampaignService.create_campaign(sample_campaign_data)

        call_args = mock_mongodb["campaigns"].insert_one.call_args[0][0]
        assert call_args["body_html"] == "<h1>Hello</h1><p>Test body</p>"

    async def test_stores_scheduled_sends(self, mock_mongodb, sample_campaign_data):
        """Should store scheduled_sends list."""
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId())
        )

        await CampaignService.create_campaign(sample_campaign_data)

        call_args = mock_mongodb["campaigns"].insert_one.call_args[0][0]
        assert len(call_args["scheduled_sends"]) == 2

    async def test_returns_campaign_id(self, mock_mongodb, sample_campaign_data):
        """Should return valid campaign ID."""
        expected_id = ObjectId("507f1f77bcf86cd799439020")
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=expected_id)
        )

        campaign_id = await CampaignService.create_campaign(sample_campaign_data)

        assert campaign_id == str(expected_id)

    async def test_sets_status_scheduled(self, mock_mongodb, sample_campaign_data):
        """Should set initial status to SCHEDULED."""
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId())
        )

        await CampaignService.create_campaign(sample_campaign_data)

        call_args = mock_mongodb["campaigns"].insert_one.call_args[0][0]
        assert call_args["status"] == "scheduled"


class TestExecuteCampaign:
    """Tests for campaign execution."""

    async def test_fetches_subscribed_emails(self, mock_mongodb, sample_campaign_doc):
        """Should fetch subscribed emails from user service."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        with patch(
            "app.services.campaign_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
        ) as mock_get_emails:
            mock_get_emails.return_value = []

            await CampaignService.execute_campaign(
                "507f1f77bcf86cd799439020",
                unsubscribe_url_base="http://test.com/unsubscribe",
            )

            mock_get_emails.assert_called_once()

    async def test_sends_emails_to_all_users(self, mock_mongodb, sample_campaign_doc):
        """Should send emails to all subscribed users."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        mock_emails = ["user1@example.com", "user2@example.com"]

        with patch(
            "app.services.campaign_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=mock_emails,
        ):
            with patch(
                "app.services.campaign_service.UserServiceClient.record_mail_received",
                new_callable=AsyncMock,
            ):
                with patch(
                    "app.services.campaign_service.EmailService.send_bulk",
                    new_callable=AsyncMock,
                ) as mock_send:
                    mock_send.return_value = [
                        SendResult(email="user1@example.com", success=True),
                        SendResult(email="user2@example.com", success=True),
                    ]

                    result = await CampaignService.execute_campaign(
                        "507f1f77bcf86cd799439020",
                        unsubscribe_url_base="http://test.com/unsubscribe",
                    )

                    assert mock_send.call_count == 1
                    assert result.sent_count == 2

    async def test_records_mail_received(self, mock_mongodb, sample_campaign_doc):
        """Should record mail received for successful sends."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        mock_emails = ["user1@example.com", "user2@example.com"]

        with patch(
            "app.services.campaign_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=mock_emails,
        ):
            with patch(
                "app.services.campaign_service.UserServiceClient.record_mail_received",
                new_callable=AsyncMock,
            ) as mock_record:
                with patch(
                    "app.services.campaign_service.EmailService.send_bulk",
                    new_callable=AsyncMock,
                ) as mock_send:
                    mock_send.return_value = [
                        SendResult(email="user1@example.com", success=True),
                        SendResult(email="user2@example.com", success=True),
                    ]

                    await CampaignService.execute_campaign(
                        "507f1f77bcf86cd799439020",
                        unsubscribe_url_base="http://test.com/unsubscribe",
                    )

                    # Should be called for each successful send
                    assert mock_record.call_count == 2
                    mock_record.assert_any_call(
                        "user1@example.com", "507f1f77bcf86cd799439020"
                    )
                    mock_record.assert_any_call(
                        "user2@example.com", "507f1f77bcf86cd799439020"
                    )

    async def test_records_execution(self, mock_mongodb, sample_campaign_doc):
        """Should record execution in database."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        with patch(
            "app.services.campaign_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=[],
        ):
            await CampaignService.execute_campaign(
                "507f1f77bcf86cd799439020",
                unsubscribe_url_base="http://test.com/unsubscribe",
            )

            # Check that update_one was called with execution record
            calls = mock_mongodb["campaigns"].update_one.call_args_list
            # At least one call should have $push for executions
            push_calls = [c for c in calls if "$push" in str(c)]
            assert len(push_calls) > 0

    async def test_with_no_subscribed_users(self, mock_mongodb, sample_campaign_doc):
        """Should complete with 0 sent when no users subscribed."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        with patch(
            "app.services.campaign_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=[],
        ):
            result = await CampaignService.execute_campaign(
                "507f1f77bcf86cd799439020",
                unsubscribe_url_base="http://test.com/unsubscribe",
            )

            assert result.sent_count == 0
            assert result.failed_count == 0


class TestTriggerNow:
    """Tests for immediate trigger."""

    async def test_sends_immediately(self, mock_mongodb, sample_campaign_doc):
        """Should send emails immediately."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        with patch(
            "app.services.campaign_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=[],
        ):
            result = await CampaignService.trigger_now(
                "507f1f77bcf86cd799439020",
                unsubscribe_url_base="http://test.com/unsubscribe",
            )

            assert result is not None

    async def test_trigger_nonexistent_raises(self, mock_mongodb):
        """Should raise CampaignNotFoundError for nonexistent campaign."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=None)

        with pytest.raises(CampaignNotFoundError):
            await CampaignService.trigger_now("nonexistent-id")


class TestUpdateCampaign:
    """Tests for campaign updates."""

    async def test_modifies_subject(self, mock_mongodb, sample_campaign_doc):
        """Should update campaign subject."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        update = CampaignUpdate(subject="New Subject")
        await CampaignService.update_campaign("507f1f77bcf86cd799439020", update)

        call_args = mock_mongodb["campaigns"].update_one.call_args
        assert call_args[0][1]["$set"]["subject"] == "New Subject"

    async def test_cannot_update_completed_campaign(
        self, mock_mongodb, sample_campaign_doc
    ):
        """Should raise error when updating completed campaign."""
        sample_campaign_doc["status"] = "completed"
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)

        with pytest.raises(ValueError, match="Cannot update a completed campaign"):
            await CampaignService.update_campaign(
                "507f1f77bcf86cd799439020",
                CampaignUpdate(subject="New"),
            )

    async def test_update_nonexistent_raises(self, mock_mongodb):
        """Should raise CampaignNotFoundError for nonexistent campaign."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=None)

        with pytest.raises(CampaignNotFoundError):
            await CampaignService.update_campaign(
                "nonexistent-id",
                CampaignUpdate(subject="New"),
            )


class TestGetCampaign:
    """Tests for getting campaigns."""

    async def test_returns_campaign(self, mock_mongodb, sample_campaign_doc):
        """Should return campaign response."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)

        campaign = await CampaignService.get_campaign("507f1f77bcf86cd799439020")

        assert campaign is not None
        assert campaign.subject == "Test Campaign"

    async def test_returns_none_when_not_found(self, mock_mongodb):
        """Should return None when campaign not found."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=None)

        campaign = await CampaignService.get_campaign("nonexistent-id")

        assert campaign is None


class TestListCampaigns:
    """Tests for listing campaigns."""

    async def test_returns_campaigns(self, mock_mongodb, sample_campaign_doc):
        """Should return list of campaigns."""
        mock_cursor = create_async_cursor([sample_campaign_doc])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        campaigns = await CampaignService.list_campaigns()

        assert len(campaigns) == 1
        assert campaigns[0].subject == "Test Campaign"
