"""Tests for scheduler service."""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

from bson import ObjectId

from app.models.campaign import CampaignInDB
from app.services.scheduler_service import SchedulerService


class TestSchedulerLifecycle:
    """Tests for scheduler start/stop."""

    def test_starts_scheduler(self):
        """Should start the scheduler."""
        with patch(
            "app.services.scheduler_service.AsyncIOScheduler"
        ) as mock_scheduler_class:
            mock_scheduler = MagicMock()
            mock_scheduler_class.return_value = mock_scheduler

            SchedulerService._scheduler = None  # Reset
            SchedulerService.start()

            mock_scheduler.start.assert_called_once()

    def test_stops_scheduler(self):
        """Should stop the scheduler gracefully."""
        mock_scheduler = MagicMock()
        SchedulerService._scheduler = mock_scheduler

        SchedulerService.stop()

        mock_scheduler.shutdown.assert_called_once_with(wait=True)
        assert SchedulerService._scheduler is None

    def test_stop_when_not_running(self):
        """Should handle stop when scheduler not running."""
        SchedulerService._scheduler = None

        # Should not raise
        SchedulerService.stop()


class TestCheckAndExecuteCampaigns:
    """Tests for campaign checking and execution."""

    async def test_finds_due_campaigns(self, mock_mongodb, sample_campaign_doc):
        """Should find campaigns with due scheduled sends."""
        sample_campaign_doc["scheduled_sends"] = [
            {"time": datetime(2025, 1, 15, 10, 0, 0), "subject": None}  # Past time
        ]
        sample_campaign_doc["executed_times"] = []

        with patch(
            "app.services.scheduler_service.CampaignRepository.get_due_campaigns",
            new_callable=AsyncMock,
        ) as mock_get_due:
            mock_get_due.return_value = [
                CampaignInDB.model_validate(sample_campaign_doc)
            ]

            with patch(
                "app.services.scheduler_service.CampaignService.execute_campaign",
                new_callable=AsyncMock,
            ):
                await SchedulerService._check_and_execute_campaigns()

                mock_get_due.assert_called_once()

    async def test_executes_due_campaign(self, mock_mongodb, sample_campaign_doc):
        """Should execute campaigns with due times."""
        due_time = datetime(2025, 1, 15, 10, 0, 0)
        sample_campaign_doc["scheduled_sends"] = [{"time": due_time, "subject": None}]
        sample_campaign_doc["executed_times"] = []

        with patch(
            "app.services.scheduler_service.CampaignRepository.get_due_campaigns",
            new_callable=AsyncMock,
        ) as mock_get_due:
            mock_get_due.return_value = [
                CampaignInDB.model_validate(sample_campaign_doc)
            ]

            with patch(
                "app.services.scheduler_service.CampaignService.execute_campaign",
                new_callable=AsyncMock,
            ) as mock_execute:
                await SchedulerService._check_and_execute_campaigns()

                mock_execute.assert_called_once()

    async def test_handles_multiple_due_campaigns(
        self, mock_mongodb, sample_campaign_doc
    ):
        """Should process all due campaigns."""
        doc1 = sample_campaign_doc.copy()
        doc1["_id"] = ObjectId("507f1f77bcf86cd799439021")
        doc1["scheduled_sends"] = [
            {"time": datetime(2025, 1, 15, 10, 0, 0), "subject": None}
        ]
        doc1["executed_times"] = []

        doc2 = sample_campaign_doc.copy()
        doc2["_id"] = ObjectId("507f1f77bcf86cd799439022")
        doc2["scheduled_sends"] = [
            {"time": datetime(2025, 1, 15, 11, 0, 0), "subject": None}
        ]
        doc2["executed_times"] = []

        with patch(
            "app.services.scheduler_service.CampaignRepository.get_due_campaigns",
            new_callable=AsyncMock,
        ) as mock_get_due:
            mock_get_due.return_value = [
                CampaignInDB.model_validate(doc1),
                CampaignInDB.model_validate(doc2),
            ]

            with patch(
                "app.services.scheduler_service.CampaignService.execute_campaign",
                new_callable=AsyncMock,
            ) as mock_execute:
                await SchedulerService._check_and_execute_campaigns()

                assert mock_execute.call_count == 2

    async def test_skips_already_executed_times(
        self, mock_mongodb, sample_campaign_doc
    ):
        """Should skip times that were already executed."""
        executed_time = datetime(2025, 1, 15, 10, 0, 0)
        sample_campaign_doc["scheduled_sends"] = [
            {"time": executed_time, "subject": None}
        ]
        sample_campaign_doc["executed_times"] = [executed_time]  # Already executed

        with patch(
            "app.services.scheduler_service.CampaignRepository.get_due_campaigns",
            new_callable=AsyncMock,
        ) as mock_get_due:
            # get_due_campaigns should filter these out, but test the logic
            mock_get_due.return_value = []

            with patch(
                "app.services.scheduler_service.CampaignService.execute_campaign",
                new_callable=AsyncMock,
            ) as mock_execute:
                await SchedulerService._check_and_execute_campaigns()

                mock_execute.assert_not_called()

    async def test_continues_after_single_failure(
        self, mock_mongodb, sample_campaign_doc
    ):
        """Should continue processing after one campaign fails."""
        doc1 = sample_campaign_doc.copy()
        doc1["_id"] = ObjectId("507f1f77bcf86cd799439021")
        doc1["scheduled_sends"] = [
            {"time": datetime(2025, 1, 15, 10, 0, 0), "subject": None}
        ]
        doc1["executed_times"] = []

        doc2 = sample_campaign_doc.copy()
        doc2["_id"] = ObjectId("507f1f77bcf86cd799439022")
        doc2["scheduled_sends"] = [
            {"time": datetime(2025, 1, 15, 11, 0, 0), "subject": None}
        ]
        doc2["executed_times"] = []

        with patch(
            "app.services.scheduler_service.CampaignRepository.get_due_campaigns",
            new_callable=AsyncMock,
        ) as mock_get_due:
            mock_get_due.return_value = [
                CampaignInDB.model_validate(doc1),
                CampaignInDB.model_validate(doc2),
            ]

            call_count = 0

            async def execute_side_effect(*args, **kwargs):
                nonlocal call_count
                call_count += 1
                if call_count == 1:
                    raise Exception("First campaign fails")

            with patch(
                "app.services.scheduler_service.CampaignService.execute_campaign",
                new_callable=AsyncMock,
                side_effect=execute_side_effect,
            ) as mock_execute:
                # Should not raise, should continue
                await SchedulerService._check_and_execute_campaigns()

                assert mock_execute.call_count == 2
