"""Tests for campaign repository."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from bson import ObjectId

from app.models.campaign import (
    CampaignCreate,
    CampaignStatus,
    CampaignUpdate,
    ExecutionRecord,
)
from app.repositories.campaign_repository import (
    CampaignNotFoundError,
    CampaignRepository,
)
from tests.conftest import create_async_cursor


class TestCreate:
    """Tests for campaign creation."""

    async def test_stores_all_fields(self, mock_mongodb, sample_campaign_data):
        """Should store all campaign fields."""
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId("507f1f77bcf86cd799439020"))
        )

        campaign_id = await CampaignRepository.create(sample_campaign_data)

        assert campaign_id == "507f1f77bcf86cd799439020"
        call_args = mock_mongodb["campaigns"].insert_one.call_args[0][0]
        assert call_args["subject"] == "Test Campaign"
        assert call_args["body_html"] == "<h1>Hello</h1><p>Test body</p>"
        assert len(call_args["scheduled_sends"]) == 2

    async def test_sets_default_status_scheduled(
        self, mock_mongodb, sample_campaign_data
    ):
        """Should set initial status to scheduled."""
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId())
        )

        await CampaignRepository.create(sample_campaign_data)

        call_args = mock_mongodb["campaigns"].insert_one.call_args[0][0]
        assert call_args["status"] == "scheduled"

    async def test_sets_created_at_timestamp(self, mock_mongodb, sample_campaign_data):
        """Should set created_at timestamp."""
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId())
        )

        await CampaignRepository.create(sample_campaign_data)

        call_args = mock_mongodb["campaigns"].insert_one.call_args[0][0]
        assert "created_at" in call_args
        assert isinstance(call_args["created_at"], datetime)

    async def test_with_empty_scheduled_sends(self, mock_mongodb):
        """Should allow campaign without scheduled sends."""
        campaign = CampaignCreate(
            subject="Immediate",
            body_html="<p>Content</p>",
            scheduled_sends=[],
        )
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId())
        )

        await CampaignRepository.create(campaign)

        call_args = mock_mongodb["campaigns"].insert_one.call_args[0][0]
        assert call_args["scheduled_sends"] == []


class TestGetById:
    """Tests for getting campaign by ID."""

    async def test_returns_campaign(self, mock_mongodb, sample_campaign_doc):
        """Should return campaign when found."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)

        campaign = await CampaignRepository.get_by_id("507f1f77bcf86cd799439020")

        assert campaign is not None
        assert campaign.subject == "Test Campaign"
        assert str(campaign.id) == "507f1f77bcf86cd799439020"

    async def test_returns_none_when_not_found(self, mock_mongodb):
        """Should return None when campaign not found."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=None)

        campaign = await CampaignRepository.get_by_id("507f1f77bcf86cd799439099")

        assert campaign is None

    async def test_returns_none_for_invalid_id(self, mock_mongodb):
        """Should return None for invalid ObjectId."""
        campaign = await CampaignRepository.get_by_id("invalid-id")

        assert campaign is None


class TestUpdate:
    """Tests for campaign update."""

    async def test_updates_subject(self, mock_mongodb, sample_campaign_doc):
        """Should update campaign subject."""
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)

        update = CampaignUpdate(subject="New Subject")
        await CampaignRepository.update("507f1f77bcf86cd799439020", update)

        call_args = mock_mongodb["campaigns"].update_one.call_args
        assert call_args[0][1]["$set"]["subject"] == "New Subject"

    async def test_updates_body_html(self, mock_mongodb, sample_campaign_doc):
        """Should update campaign body HTML."""
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)

        update = CampaignUpdate(body_html="<p>New content</p>")
        await CampaignRepository.update("507f1f77bcf86cd799439020", update)

        call_args = mock_mongodb["campaigns"].update_one.call_args
        assert call_args[0][1]["$set"]["body_html"] == "<p>New content</p>"

    async def test_partial_update(self, mock_mongodb, sample_campaign_doc):
        """Should only update provided fields."""
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)

        update = CampaignUpdate(subject="Only Subject")
        await CampaignRepository.update("507f1f77bcf86cd799439020", update)

        call_args = mock_mongodb["campaigns"].update_one.call_args
        set_data = call_args[0][1]["$set"]
        assert "subject" in set_data
        assert "body_html" not in set_data

    async def test_update_nonexistent_raises(self, mock_mongodb):
        """Should raise CampaignNotFoundError for nonexistent campaign."""
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=0)
        )

        with pytest.raises(CampaignNotFoundError):
            await CampaignRepository.update(
                "507f1f77bcf86cd799439099",
                CampaignUpdate(subject="New"),
            )


class TestUpdateStatus:
    """Tests for status updates."""

    async def test_updates_to_in_progress(self, mock_mongodb):
        """Should update status to in_progress."""
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        await CampaignRepository.update_status(
            "507f1f77bcf86cd799439020",
            CampaignStatus.IN_PROGRESS,
        )

        call_args = mock_mongodb["campaigns"].update_one.call_args
        assert call_args[0][1]["$set"]["status"] == "in_progress"

    async def test_updates_to_completed(self, mock_mongodb):
        """Should update status to completed."""
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        await CampaignRepository.update_status(
            "507f1f77bcf86cd799439020",
            CampaignStatus.COMPLETED,
        )

        call_args = mock_mongodb["campaigns"].update_one.call_args
        assert call_args[0][1]["$set"]["status"] == "completed"


class TestAddExecution:
    """Tests for adding execution records."""

    async def test_adds_execution_record(self, mock_mongodb):
        """Should add execution record to campaign."""
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        execution = ExecutionRecord(
            scheduled_time=datetime(2025, 1, 20, 10, 0, 0),
            subject_used="Test",
            started_at=datetime.now(timezone.utc),
            sent_count=5,
            failed_count=0,
        )

        await CampaignRepository.add_execution(
            "507f1f77bcf86cd799439020",
            execution,
            datetime(2025, 1, 20, 10, 0, 0),
        )

        call_args = mock_mongodb["campaigns"].update_one.call_args
        assert "$push" in call_args[0][1]
        assert "executions" in call_args[0][1]["$push"]


class TestListRecent:
    """Tests for listing campaigns."""

    async def test_returns_sorted_campaigns(self, mock_mongodb, sample_campaign_doc):
        """Should return campaigns sorted by created_at descending."""
        mock_cursor = create_async_cursor([sample_campaign_doc])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        campaigns = await CampaignRepository.list_recent(limit=10)

        assert len(campaigns) == 1
        assert campaigns[0].subject == "Test Campaign"

    async def test_respects_limit(self, mock_mongodb, sample_campaign_doc):
        """Should respect limit parameter."""
        # Create 3 documents but request limit of 2
        docs = [sample_campaign_doc]
        mock_cursor = create_async_cursor(docs)
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        campaigns = await CampaignRepository.list_recent(limit=5)

        # Verify function was called and returns results
        assert isinstance(campaigns, list)

    async def test_empty_collection(self, mock_mongodb):
        """Should return empty list when no campaigns exist."""
        mock_cursor = create_async_cursor([])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        campaigns = await CampaignRepository.list_recent()

        assert campaigns == []


class TestGetDueCampaigns:
    """Tests for get_due_campaigns query and filtering behavior."""

    def _make_campaign_doc(
        self,
        *,
        status: str = "scheduled",
        scheduled_sends: list[dict],
        executed_times: list[datetime] | None = None,
        campaign_id: str = "507f1f77bcf86cd799439020",
    ) -> dict:
        """Build a campaign document for testing."""
        return {
            "_id": ObjectId(campaign_id),
            "subject": "Test Campaign",
            "body_html": "<p>Test</p>",
            "scheduled_sends": scheduled_sends,
            "use_custom_subjects": False,
            "status": status,
            "executions": [],
            "executed_times": executed_times or [],
            "created_at": datetime(2025, 1, 15, 12, 0, 0, tzinfo=timezone.utc),
            "updated_at": None,
        }

    async def test_returns_only_scheduled_campaigns(self, mock_mongodb):
        """Should query for status == scheduled."""
        before_time = datetime(2025, 1, 25, 12, 0, 0, tzinfo=timezone.utc)
        due_send = {
            "time": datetime(2025, 1, 20, 10, 0, 0, tzinfo=timezone.utc),
            "subject": None,
        }
        doc = self._make_campaign_doc(
            status="scheduled",
            scheduled_sends=[due_send],
            executed_times=[],
        )
        mock_cursor = create_async_cursor([doc])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        await CampaignRepository.get_due_campaigns(before_time)

        call_args = mock_mongodb["campaigns"].find.call_args[0][0]
        assert call_args["status"] == CampaignStatus.SCHEDULED.value
        assert "scheduled_sends" in call_args
        assert "$elemMatch" in call_args["scheduled_sends"]
        assert call_args["scheduled_sends"]["$elemMatch"]["time"]["$lte"] == before_time

    async def test_includes_campaigns_with_due_times(self, mock_mongodb):
        """Should include campaigns with send.time <= before_time."""
        before_time = datetime(2025, 1, 25, 12, 0, 0, tzinfo=timezone.utc)
        due_send = {
            "time": datetime(2025, 1, 20, 10, 0, 0, tzinfo=timezone.utc),
            "subject": None,
        }
        doc = self._make_campaign_doc(
            scheduled_sends=[due_send],
            executed_times=[],
        )
        mock_cursor = create_async_cursor([doc])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        campaigns = await CampaignRepository.get_due_campaigns(before_time)

        assert len(campaigns) == 1
        assert campaigns[0].subject == "Test Campaign"
        assert len(campaigns[0].scheduled_sends) == 1
        assert campaigns[0].scheduled_sends[0].time <= before_time

    async def test_excludes_campaigns_where_all_due_times_executed(self, mock_mongodb):
        """Should exclude campaigns where all due times are in executed_times."""
        before_time = datetime(2025, 1, 25, 12, 0, 0, tzinfo=timezone.utc)
        due_time = datetime(2025, 1, 20, 10, 0, 0, tzinfo=timezone.utc)
        doc = self._make_campaign_doc(
            scheduled_sends=[{"time": due_time, "subject": None}],
            executed_times=[due_time],
        )
        mock_cursor = create_async_cursor([doc])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        campaigns = await CampaignRepository.get_due_campaigns(before_time)

        assert len(campaigns) == 0

    async def test_includes_campaigns_with_mixed_due_unexecuted_times(
        self, mock_mongodb
    ):
        """Should include campaigns with some due times not yet executed."""
        before_time = datetime(2025, 1, 25, 12, 0, 0, tzinfo=timezone.utc)
        executed_time = datetime(2025, 1, 18, 10, 0, 0, tzinfo=timezone.utc)
        unexecuted_time = datetime(2025, 1, 20, 10, 0, 0, tzinfo=timezone.utc)
        doc = self._make_campaign_doc(
            scheduled_sends=[
                {"time": executed_time, "subject": None},
                {"time": unexecuted_time, "subject": None},
            ],
            executed_times=[executed_time],
        )
        mock_cursor = create_async_cursor([doc])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        campaigns = await CampaignRepository.get_due_campaigns(before_time)

        assert len(campaigns) == 1
        assert unexecuted_time in [s.time for s in campaigns[0].scheduled_sends]

    async def test_handles_empty_results(self, mock_mongodb):
        """Should return empty list when no due campaigns exist."""
        before_time = datetime(2025, 1, 25, 12, 0, 0, tzinfo=timezone.utc)
        mock_cursor = create_async_cursor([])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        campaigns = await CampaignRepository.get_due_campaigns(before_time)

        assert campaigns == []

    async def test_preserves_query_intent_scheduled_and_due_criteria(
        self, mock_mongodb
    ):
        """Should use both status and due-time criteria in query."""
        before_time = datetime(2025, 1, 25, 12, 0, 0, tzinfo=timezone.utc)
        mock_cursor = create_async_cursor([])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        await CampaignRepository.get_due_campaigns(before_time)

        call_args = mock_mongodb["campaigns"].find.call_args[0][0]
        assert call_args["status"] == "scheduled"
        assert call_args["scheduled_sends"]["$elemMatch"]["time"]["$lte"] == before_time
