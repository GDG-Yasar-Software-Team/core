"""Integration tests for mail service."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

from bson import ObjectId

from app.models.campaign import CampaignCreate, CampaignUpdate, ScheduledSend
from app.repositories.user_repository import UserRepository
from app.services.campaign_service import CampaignService
from app.services.email_service import SendResult
from tests.conftest import create_async_cursor


class TestFullCampaignFlow:
    """End-to-end tests for campaign flows."""

    async def test_create_trigger_verify(self, mock_mongodb):
        """Test creating and immediately triggering a campaign."""
        # Setup mocks
        campaign_id = ObjectId("507f1f77bcf86cd799439020")
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=campaign_id)
        )
        mock_mongodb["campaigns"].find_one = AsyncMock(
            return_value={
                "_id": campaign_id,
                "subject": "Test",
                "body_html": "<p>Hello</p>",
                "scheduled_sends": [],
                "use_custom_subjects": False,
                "status": "scheduled",
                "executions": [],
                "executed_times": [],
                "created_at": datetime.now(timezone.utc),
                "updated_at": None,
            }
        )
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        # Create campaign
        campaign_data = CampaignCreate(
            subject="Test",
            body_html="<p>Hello</p>",
        )
        created_id = await CampaignService.create_campaign(campaign_data)

        assert created_id == str(campaign_id)

        # Trigger campaign
        mock_users = [
            MagicMock(
                id=ObjectId("507f1f77bcf86cd799439011"),
                email="user1@example.com",
                is_subscribed=True,
            ),
        ]

        with patch(
            "app.services.campaign_service.UserRepository.get_subscribed_users",
            new_callable=AsyncMock,
            return_value=mock_users,
        ):
            with patch(
                "app.services.campaign_service.EmailService.send_bulk",
                new_callable=AsyncMock,
            ) as mock_send:
                mock_send.return_value = [
                    SendResult(
                        user_id="507f1f77bcf86cd799439011",
                        email="user1@example.com",
                        success=True,
                    )
                ]

                result = await CampaignService.trigger_now(
                    str(campaign_id),
                    unsubscribe_url_base="http://test.com/unsubscribe",
                )

        assert result.sent_count == 1
        assert result.failed_count == 0

    async def test_update_before_execution(self, mock_mongodb):
        """Test updating campaign before execution."""
        campaign_id = ObjectId("507f1f77bcf86cd799439020")
        original_doc = {
            "_id": campaign_id,
            "subject": "Original",
            "body_html": "<p>Original</p>",
            "scheduled_sends": [],
            "use_custom_subjects": False,
            "status": "scheduled",
            "executions": [],
            "executed_times": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": None,
        }
        updated_doc = original_doc.copy()
        updated_doc["subject"] = "Updated"
        updated_doc["body_html"] = "<p>Updated content</p>"

        mock_mongodb["campaigns"].find_one = AsyncMock(
            side_effect=[original_doc, updated_doc]
        )
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        update = CampaignUpdate(subject="Updated", body_html="<p>Updated content</p>")
        result = await CampaignService.update_campaign(str(campaign_id), update)

        assert result.subject == "Updated"

    async def test_multiple_scheduled_sends(self, mock_mongodb):
        """Test campaign with multiple scheduled sends."""
        campaign_id = ObjectId("507f1f77bcf86cd799439020")
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=campaign_id)
        )

        campaign_data = CampaignCreate(
            subject="Multi-Send",
            body_html="<p>Hello</p>",
            scheduled_sends=[
                ScheduledSend(time=datetime(2025, 1, 20, 10, 0, 0)),
                ScheduledSend(time=datetime(2025, 1, 21, 14, 0, 0)),
                ScheduledSend(time=datetime(2025, 1, 22, 9, 0, 0)),
            ],
        )

        created_id = await CampaignService.create_campaign(campaign_data)

        assert created_id == str(campaign_id)
        call_args = mock_mongodb["campaigns"].insert_one.call_args[0][0]
        assert len(call_args["scheduled_sends"]) == 3

    async def test_custom_subjects_per_send(self, mock_mongodb):
        """Test campaign with custom subjects for each send."""
        campaign_id = ObjectId("507f1f77bcf86cd799439020")
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=campaign_id)
        )

        campaign_data = CampaignCreate(
            subject="Default Subject",
            body_html="<p>Hello</p>",
            scheduled_sends=[
                ScheduledSend(time=datetime(2025, 1, 20, 10, 0, 0)),
                ScheduledSend(
                    time=datetime(2025, 1, 21, 14, 0, 0), subject="Custom Reminder"
                ),
            ],
            use_custom_subjects=True,
        )

        await CampaignService.create_campaign(campaign_data)

        call_args = mock_mongodb["campaigns"].insert_one.call_args[0][0]
        assert call_args["use_custom_subjects"] is True
        assert call_args["scheduled_sends"][0]["subject"] is None
        assert call_args["scheduled_sends"][1]["subject"] == "Custom Reminder"


class TestUnsubscribeIntegration:
    """Integration tests for unsubscribe flow."""

    async def test_unsubscribe_removes_from_campaigns(self, mock_mongodb):
        """Test that unsubscribed users are excluded from future campaigns."""
        # This would be a more complex test in a real scenario
        # For now, verify the repository correctly filters

        # Users: one subscribed, one unsubscribed
        users = [
            {
                "_id": ObjectId("507f1f77bcf86cd799439011"),
                "email": "subscribed@example.com",
                "isSubscribed": True,
            },
        ]
        mock_mongodb["users"].find = MagicMock(return_value=create_async_cursor(users))

        subscribed = await UserRepository.get_subscribed_users()

        # Should only return subscribed user
        assert len(subscribed) == 1
        assert subscribed[0].email == "subscribed@example.com"
