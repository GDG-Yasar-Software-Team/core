"""Tests for recipient batch plans (issue #134)."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bson import ObjectId

from app.models.campaign import BatchInfo, BatchPlanInDB, BatchStatus
from app.clients.user_client import UserServiceAuthError
from app.repositories.batch_plan_repository import build_batches
from app.repositories.campaign_repository import CampaignNotFoundError
from app.services.batch_plan_service import (
    BatchNotFoundError,
    BatchPlanNotFoundError,
    BatchPlanService,
)
from app.services.campaign_service import CampaignConflictError
from app.services.email_service import SendResult

CAMPAIGN_ID = "507f1f77bcf86cd799439020"
PLAN_ID = "507f1f77bcf86cd799439031"


def make_emails(n: int) -> list[str]:
    return [f"user{i:04d}@example.com" for i in range(n)]


def make_plan(
    audience: list[str],
    batch_size: int = 500,
    *,
    batch_overrides: dict[int, dict] | None = None,
) -> BatchPlanInDB:
    """Build a BatchPlanInDB with optional per-batch field overrides."""
    overrides = batch_overrides or {}
    infos = []
    for info in build_batches(audience, batch_size):
        if info.number in overrides:
            # Re-validate through the constructor so overrides become real models
            info = BatchInfo(**{**info.model_dump(), **overrides[info.number]})
        infos.append(info)
    return BatchPlanInDB.model_validate(
        {
            "_id": ObjectId(PLAN_ID),
            "campaign_id": ObjectId(CAMPAIGN_ID),
            "batch_size": batch_size,
            "audience": audience,
            "batches": [i.model_dump() for i in infos],
            "created_at": datetime(2025, 1, 15, 12, 0, 0, tzinfo=timezone.utc),
        }
    )


def campaign_doc() -> dict:
    """Full campaign document valid against CampaignInDB."""
    return {
        "_id": ObjectId(CAMPAIGN_ID),
        "subject": "Test Campaign",
        "body_html": "<h1>Hello</h1>",
        "scheduled_sends": [],
        "use_custom_subjects": False,
        "status": "scheduled",
        "executions": [],
        "executed_times": [],
        "created_at": datetime(2025, 1, 15, 12, 0, 0, tzinfo=timezone.utc),
        "updated_at": None,
    }


def _bulk_sender(results: list[SendResult]):
    """Stand-in for EmailService.send_bulk that fires result_callback per email."""
    calls: dict = {}

    async def fake(*args, **kwargs):
        calls["kwargs"] = kwargs
        callback = kwargs.get("result_callback")
        if callback:
            for r in results:
                await callback(r)
        return results

    fake.calls = calls
    return fake


class TestBuildBatches:
    """Pure batch-balancing logic."""

    def test_1000_cap_500_gives_two_ranges_of_500(self):
        batches = build_batches(make_emails(1000), 500)
        assert [(b.number, b.start, b.end, b.recipient_count) for b in batches] == [
            (1, 1, 500, 500),
            (2, 501, 1000, 500),
        ]

    def test_1200_cap_500_gives_three_balanced_batches_of_400(self):
        batches = build_batches(make_emails(1200), 500)
        assert [(b.number, b.start, b.end, b.recipient_count) for b in batches] == [
            (1, 1, 400, 400),
            (2, 401, 800, 400),
            (3, 801, 1200, 400),
        ]

    def test_1001_cap_500_is_balanced_within_cap(self):
        batches = build_batches(make_emails(1001), 500)
        assert len(batches) == 3
        assert all(b.recipient_count <= 500 for b in batches)
        assert sum(b.recipient_count for b in batches) == 1001
        # Contiguous 1-based inclusive ranges covering the whole audience
        assert batches[0].start == 1
        for prev, curr in zip(batches, batches[1:]):
            assert curr.start == prev.end + 1
        assert batches[-1].end == 1001

    def test_empty_audience_gives_no_batches(self):
        assert build_batches([], 500) == []

    def test_below_cap_gives_single_batch(self):
        batches = build_batches(make_emails(10), 500)
        assert len(batches) == 1
        assert batches[0].recipient_count == 10
        assert (batches[0].start, batches[0].end) == (1, 10)


class TestCreatePlan:
    """POST /campaigns/{id}/batch-plans via service."""

    async def test_creates_plan_with_snapshot_and_metadata(self, mock_mongodb):
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId(PLAN_ID))
        )
        emails = make_emails(1200)

        with patch(
            "app.services.batch_plan_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=emails,
        ):
            response = await BatchPlanService.create_plan(CAMPAIGN_ID)

        doc = mock_mongodb["batch_plans"].insert_one.call_args[0][0]
        # Audience snapshot is deterministic (sorted, deduped) and frozen in DB
        assert doc["audience"] == sorted(set(emails), key=str.casefold)
        assert doc["campaign_id"] == ObjectId(CAMPAIGN_ID)
        assert response.id == PLAN_ID
        assert response.batch_size == 500
        assert response.total_recipients == 1200
        assert [(b.start, b.end) for b in response.batches] == [
            (1, 400),
            (401, 800),
            (801, 1200),
        ]

    async def test_snapshot_dedupes_and_sorts(self, mock_mongodb):
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId(PLAN_ID))
        )
        with patch(
            "app.services.batch_plan_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=["B@x.com", "a@x.com", "a@x.com"],
        ):
            response = await BatchPlanService.create_plan(CAMPAIGN_ID)

        assert response.total_recipients == 2
        assert response.batches[0].recipient_count == 2

    async def test_unknown_campaign_raises(self, mock_mongodb):
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=None)
        with pytest.raises(CampaignNotFoundError):
            await BatchPlanService.create_plan(CAMPAIGN_ID)

    async def test_user_service_error_propagates(self, mock_mongodb):
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        with patch(
            "app.services.batch_plan_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            side_effect=UserServiceAuthError("bad token"),
        ):
            with pytest.raises(UserServiceAuthError):
                await BatchPlanService.create_plan(CAMPAIGN_ID)


class TestGetPlan:
    """GET /campaigns/{id}/batch-plans/{plan_id} via service."""

    async def test_returns_batches_with_counts(self, mock_mongodb):
        plan = make_plan(
            make_emails(3),
            3,
            batch_overrides={
                1: {
                    "status": BatchStatus.PARTIALLY_FAILED,
                    "sent_emails": ["user0000@example.com"],
                    "failed_emails": ["user0001@example.com"],
                },
            },
        )
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )

        response = await BatchPlanService.get_plan(CAMPAIGN_ID, PLAN_ID)

        assert response.id == PLAN_ID
        batch = response.batches[0]
        assert batch.status == BatchStatus.PARTIALLY_FAILED
        assert batch.sent_count == 1
        assert batch.failed_count == 1
        assert batch.remaining_count == 2

    async def test_unknown_plan_raises(self, mock_mongodb):
        mock_mongodb["batch_plans"].find_one = AsyncMock(return_value=None)
        with pytest.raises(BatchPlanNotFoundError):
            await BatchPlanService.get_plan(CAMPAIGN_ID, PLAN_ID)


class TestTriggerBatch:
    """POST .../batches/{n}/trigger via service."""

    def _patch_orchestration(self):
        """Patch repo/lock methods used by trigger_batch."""
        return [
            patch(
                "app.services.batch_plan_service.CampaignRepository.get_by_id",
                new_callable=AsyncMock,
                return_value=MagicMock(id=ObjectId(CAMPAIGN_ID), status="scheduled"),
            ),
            patch(
                "app.services.batch_plan_service.BatchPlanRepository.claim_batch",
                new_callable=AsyncMock,
                return_value=True,
            ),
            patch(
                "app.services.batch_plan_service."
                "CampaignRepository.mark_in_progress_if_allowed",
                new_callable=AsyncMock,
                return_value=True,
            ),
        ]

    async def test_triggers_batch_and_returns_metadata(self, mock_mongodb):
        plan = make_plan(make_emails(2), 2)
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )
        patches = self._patch_orchestration()

        with patch("app.services.batch_plan_service.asyncio.create_task"):
            with patch(
                "app.services.batch_plan_service."
                "CampaignRepository.mark_in_progress_if_allowed",
                new_callable=AsyncMock,
                return_value=True,
            ):
                with patches[0], patches[1]:
                    response = await BatchPlanService.trigger_batch(
                        CAMPAIGN_ID, PLAN_ID, 1
                    )

        assert response.status == "in_progress"
        assert response.recipient_count == 2
        assert response.plan_id == PLAN_ID
        assert response.batch_number == 1

    async def test_missing_campaign_raises_404(self, mock_mongodb):
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=None)
        with pytest.raises(CampaignNotFoundError):
            await BatchPlanService.trigger_batch(CAMPAIGN_ID, PLAN_ID, 1)

    async def test_missing_plan_raises_404(self, mock_mongodb):
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].find_one = AsyncMock(return_value=None)
        with pytest.raises(BatchPlanNotFoundError):
            await BatchPlanService.trigger_batch(CAMPAIGN_ID, PLAN_ID, 1)

    async def test_missing_batch_raises_404(self, mock_mongodb):
        plan = make_plan(make_emails(1), 1)
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )
        with pytest.raises(BatchNotFoundError):
            await BatchPlanService.trigger_batch(CAMPAIGN_ID, PLAN_ID, 99)

    async def test_completed_batch_cannot_be_resent(self, mock_mongodb):
        plan = make_plan(
            make_emails(1),
            1,
            batch_overrides={1: {"status": BatchStatus.COMPLETED}},
        )
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )
        with pytest.raises(CampaignConflictError, match="completed"):
            await BatchPlanService.trigger_batch(CAMPAIGN_ID, PLAN_ID, 1)

    async def test_in_progress_batch_conflicts(self, mock_mongodb):
        plan = make_plan(
            make_emails(1),
            1,
            batch_overrides={1: {"status": BatchStatus.IN_PROGRESS}},
        )
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )
        with pytest.raises(CampaignConflictError, match="in progress"):
            await BatchPlanService.trigger_batch(CAMPAIGN_ID, PLAN_ID, 1)

    async def test_stale_in_progress_batch_is_recovered_and_retried(
        self, mock_mongodb, mock_settings
    ):
        mock_settings.STALE_IN_PROGRESS_MINUTES = 60
        plan = make_plan(
            make_emails(1),
            1,
            batch_overrides={
                1: {
                    "status": BatchStatus.IN_PROGRESS,
                    "current_progress": {
                        "total_recipients": 1,
                        "sent_count": 0,
                        "failed_count": 0,
                        "started_at": datetime(2020, 1, 1, tzinfo=timezone.utc),
                        "is_complete": False,
                    },
                },
            },
        )
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )
        mock_mongodb["batch_plans"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1, modified_count=1)
        )
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1, modified_count=1)
        )

        with patch("app.services.batch_plan_service.asyncio.create_task"):
            response = await BatchPlanService.trigger_batch(CAMPAIGN_ID, PLAN_ID, 1)

        assert response.status == "in_progress"

    async def test_claim_race_conflicts(self, mock_mongodb):
        plan = make_plan(make_emails(1), 1)
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )
        # Atomic claim loses the race → conflict, nothing else touched
        mock_mongodb["batch_plans"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1, modified_count=0)
        )

        with pytest.raises(CampaignConflictError, match="already"):
            await BatchPlanService.trigger_batch(CAMPAIGN_ID, PLAN_ID, 1)

    async def test_campaign_in_progress_releases_batch_claim(self, mock_mongodb):
        plan = make_plan(make_emails(1), 1)
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )
        mock_mongodb["batch_plans"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1, modified_count=1)
        )
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1, modified_count=0)
        )

        with pytest.raises(CampaignConflictError, match="Campaign"):
            await BatchPlanService.trigger_batch(CAMPAIGN_ID, PLAN_ID, 1)

        release_calls = [
            c
            for c in mock_mongodb["batch_plans"].update_one.call_args_list
            if "pending" in str(c)
        ]
        assert len(release_calls) == 1


class TestRunBatch:
    """Batch execution semantics."""

    def _setup_mocks(
        self,
        mock_mongodb,
        plan: BatchPlanInDB,
        campaign_subject: str = "Test Campaign",
        campaign_body: str = "<p>Hello</p>",
    ):
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )
        mock_mongodb["batch_plans"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )
        return patch(
            "app.services.batch_plan_service.CampaignRepository.get_by_id",
            new_callable=AsyncMock,
            return_value=MagicMock(
                id=ObjectId(CAMPAIGN_ID),
                subject=campaign_subject,
                body_html=campaign_body,
            ),
        )

    async def test_unsubscribed_recipients_are_skipped(self, mock_mongodb):
        plan = make_plan(["a@x.com", "b@x.com", "c@x.com"], 3)
        campaign_patch = self._setup_mocks(mock_mongodb, plan)
        sender = _bulk_sender(
            [
                SendResult(email="a@x.com", success=True),
                SendResult(email="c@x.com", success=True),
            ]
        )

        with campaign_patch:
            with patch(
                "app.services.batch_plan_service."
                "UserServiceClient.get_subscribed_emails",
                new_callable=AsyncMock,
                return_value=["a@x.com", "c@x.com"],
            ):
                with patch(
                    "app.services.batch_plan_service."
                    "UserServiceClient.record_mail_received",
                    new_callable=AsyncMock,
                ):
                    with patch(
                        "app.services.batch_plan_service.EmailService.send_bulk",
                        new=sender,
                    ):
                        with patch(
                            "app.services.batch_plan_service."
                            "BatchPlanRepository.finish_batch",
                            new_callable=AsyncMock,
                        ):
                            await BatchPlanService._run_batch(
                                CAMPAIGN_ID,
                                PLAN_ID,
                                1,
                                unsubscribe_url_base="http://test",
                            )

        assert sender.calls["kwargs"]["recipients"] == ["a@x.com", "c@x.com"]

    async def test_retry_targets_only_failed_recipients(self, mock_mongodb):
        # First run sent a, failed b; c unsubscribed since. Retry targets only b.
        plan = make_plan(
            ["a@x.com", "b@x.com", "c@x.com"],
            3,
            batch_overrides={
                1: {
                    "status": BatchStatus.PARTIALLY_FAILED,
                    "sent_emails": ["a@x.com"],
                    "failed_emails": ["b@x.com"],
                },
            },
        )
        campaign_patch = self._setup_mocks(mock_mongodb, plan)
        sender = _bulk_sender([SendResult(email="b@x.com", success=True)])

        with campaign_patch:
            with patch(
                "app.services.batch_plan_service."
                "UserServiceClient.get_subscribed_emails",
                new_callable=AsyncMock,
                return_value=["a@x.com", "b@x.com"],
            ):
                with patch(
                    "app.services.batch_plan_service."
                    "UserServiceClient.record_mail_received",
                    new_callable=AsyncMock,
                ):
                    with patch(
                        "app.services.batch_plan_service.EmailService.send_bulk",
                        new=sender,
                    ):
                        with patch(
                            "app.services.batch_plan_service."
                            "BatchPlanRepository.finish_batch",
                            new_callable=AsyncMock,
                        ):
                            await BatchPlanService._run_batch(
                                CAMPAIGN_ID,
                                PLAN_ID,
                                1,
                                unsubscribe_url_base="http://test",
                            )

        assert sender.calls["kwargs"]["recipients"] == ["b@x.com"]

    async def test_all_sent_marks_batch_completed(self, mock_mongodb):
        plan = make_plan(["a@x.com", "b@x.com"], 2)
        campaign_patch = self._setup_mocks(mock_mongodb, plan)
        sender = _bulk_sender(
            [
                SendResult(email="a@x.com", success=True),
                SendResult(email="b@x.com", success=True),
            ]
        )

        with campaign_patch:
            with patch(
                "app.services.batch_plan_service."
                "UserServiceClient.get_subscribed_emails",
                new_callable=AsyncMock,
                return_value=["a@x.com", "b@x.com"],
            ):
                with patch(
                    "app.services.batch_plan_service."
                    "UserServiceClient.record_mail_received",
                    new_callable=AsyncMock,
                ):
                    with patch(
                        "app.services.batch_plan_service.EmailService.send_bulk",
                        new=sender,
                    ):
                        with patch(
                            "app.services.batch_plan_service."
                            "BatchPlanRepository.finish_batch",
                            new_callable=AsyncMock,
                        ) as mock_finish:
                            await BatchPlanService._run_batch(
                                CAMPAIGN_ID,
                                PLAN_ID,
                                1,
                                unsubscribe_url_base="http://test",
                            )

        assert mock_finish.call_args.args[3] == BatchStatus.COMPLETED

    async def test_partial_failure_records_mail_received_and_marks_partially_failed(
        self, mock_mongodb
    ):
        plan = make_plan(["a@x.com", "b@x.com"], 2)
        campaign_patch = self._setup_mocks(mock_mongodb, plan)
        sender = _bulk_sender(
            [
                SendResult(email="a@x.com", success=True),
                SendResult(email="b@x.com", success=False, error="smtp"),
            ]
        )

        with campaign_patch:
            with patch(
                "app.services.batch_plan_service."
                "UserServiceClient.get_subscribed_emails",
                new_callable=AsyncMock,
                return_value=["a@x.com", "b@x.com"],
            ):
                with patch(
                    "app.services.batch_plan_service."
                    "UserServiceClient.record_mail_received",
                    new_callable=AsyncMock,
                ) as mock_record:
                    with patch(
                        "app.services.batch_plan_service.EmailService.send_bulk",
                        new=sender,
                    ):
                        with patch(
                            "app.services.batch_plan_service."
                            "BatchPlanRepository.finish_batch",
                            new_callable=AsyncMock,
                        ) as mock_finish:
                            await BatchPlanService._run_batch(
                                CAMPAIGN_ID,
                                PLAN_ID,
                                1,
                                unsubscribe_url_base="http://test",
                            )

        mock_record.assert_called_once_with("a@x.com", CAMPAIGN_ID)
        assert mock_finish.call_args.args[3] == BatchStatus.PARTIALLY_FAILED

    async def test_all_failed_marks_batch_failed(self, mock_mongodb):
        plan = make_plan(["a@x.com"], 1)
        campaign_patch = self._setup_mocks(mock_mongodb, plan)
        sender = _bulk_sender(
            [SendResult(email="a@x.com", success=False, error="smtp")]
        )

        with campaign_patch:
            with patch(
                "app.services.batch_plan_service."
                "UserServiceClient.get_subscribed_emails",
                new_callable=AsyncMock,
                return_value=["a@x.com"],
            ):
                with patch(
                    "app.services.batch_plan_service."
                    "UserServiceClient.record_mail_received",
                    new_callable=AsyncMock,
                ):
                    with patch(
                        "app.services.batch_plan_service.EmailService.send_bulk",
                        new=sender,
                    ):
                        with patch(
                            "app.services.batch_plan_service."
                            "BatchPlanRepository.finish_batch",
                            new_callable=AsyncMock,
                        ) as mock_finish:
                            await BatchPlanService._run_batch(
                                CAMPAIGN_ID,
                                PLAN_ID,
                                1,
                                unsubscribe_url_base="http://test",
                            )

        assert mock_finish.call_args.args[3] == BatchStatus.FAILED

    async def test_no_targets_when_everyone_unsubscribed(self, mock_mongodb):
        plan = make_plan(["a@x.com"], 1)
        campaign_patch = self._setup_mocks(mock_mongodb, plan)

        with campaign_patch:
            with patch(
                "app.services.batch_plan_service."
                "UserServiceClient.get_subscribed_emails",
                new_callable=AsyncMock,
                return_value=[],
            ):
                with patch(
                    "app.services.batch_plan_service.EmailService.send_bulk",
                    new_callable=AsyncMock,
                ) as mock_send:
                    with patch(
                        "app.services.batch_plan_service."
                        "BatchPlanRepository.finish_batch",
                        new_callable=AsyncMock,
                    ) as mock_finish:
                        await BatchPlanService._run_batch(
                            CAMPAIGN_ID,
                            PLAN_ID,
                            1,
                            unsubscribe_url_base="http://test",
                        )

        mock_send.assert_not_called()
        assert mock_finish.call_args.args[3] == BatchStatus.FAILED


class TestBatchPlanAPI:
    """HTTP endpoints for batch plans."""

    def _patch_user_service(self, emails):
        return patch(
            "app.services.batch_plan_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=emails,
        )

    def test_create_returns_plan_metadata(self, sync_client, mock_mongodb):
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId(PLAN_ID))
        )
        with self._patch_user_service(make_emails(1200)):
            response = sync_client.post(f"/campaigns/{CAMPAIGN_ID}/batch-plans")

        assert response.status_code == 201
        data = response.json()
        assert data["id"] == PLAN_ID
        assert data["campaign_id"] == CAMPAIGN_ID
        assert data["batch_size"] == 500
        assert data["total_recipients"] == 1200
        assert [(b["start"], b["end"]) for b in data["batches"]] == [
            (1, 400),
            (401, 800),
            (801, 1200),
        ]
        assert all(b["status"] == "pending" for b in data["batches"])

    def test_create_404_for_missing_campaign(self, sync_client, mock_mongodb):
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=None)
        response = sync_client.post(f"/campaigns/{CAMPAIGN_ID}/batch-plans")
        assert response.status_code == 404

    def test_create_502_when_user_service_auth_fails(self, sync_client, mock_mongodb):
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        with patch(
            "app.services.batch_plan_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            side_effect=UserServiceAuthError("bad token"),
        ):
            response = sync_client.post(f"/campaigns/{CAMPAIGN_ID}/batch-plans")

        assert response.status_code == 502
        assert response.json()["detail"]["code"] == "user_service_auth"

    def test_get_returns_plan(self, sync_client, mock_mongodb):
        plan = make_plan(make_emails(2), 2)
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )

        response = sync_client.get(f"/campaigns/{CAMPAIGN_ID}/batch-plans/{PLAN_ID}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == PLAN_ID
        assert len(data["batches"]) == 1
        assert data["batches"][0]["status"] == "pending"

    def test_get_404_for_missing_plan(self, sync_client, mock_mongodb):
        mock_mongodb["batch_plans"].find_one = AsyncMock(return_value=None)
        response = sync_client.get(f"/campaigns/{CAMPAIGN_ID}/batch-plans/{PLAN_ID}")
        assert response.status_code == 404

    def test_trigger_returns_202(self, sync_client, mock_mongodb, sample_campaign_doc):
        plan = make_plan(make_emails(2), 2)
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )
        mock_mongodb["batch_plans"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1, modified_count=1)
        )
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1, modified_count=1)
        )

        with patch("app.services.batch_plan_service.asyncio.create_task"):
            response = sync_client.post(
                f"/campaigns/{CAMPAIGN_ID}/batch-plans/{PLAN_ID}/batches/1/trigger"
            )

        assert response.status_code == 202
        data = response.json()
        assert data["status"] == "in_progress"
        assert data["recipient_count"] == 2
        assert data["batch_number"] == 1

    def test_trigger_404_for_missing_plan(self, sync_client, mock_mongodb):
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].find_one = AsyncMock(return_value=None)
        response = sync_client.post(
            f"/campaigns/{CAMPAIGN_ID}/batch-plans/{PLAN_ID}/batches/1/trigger"
        )
        assert response.status_code == 404

    def test_trigger_409_for_completed_batch(self, sync_client, mock_mongodb):
        plan = make_plan(
            make_emails(1),
            1,
            batch_overrides={1: {"status": BatchStatus.COMPLETED}},
        )
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=campaign_doc())
        mock_mongodb["batch_plans"].find_one = AsyncMock(
            return_value=plan.model_dump(by_alias=True)
        )

        response = sync_client.post(
            f"/campaigns/{CAMPAIGN_ID}/batch-plans/{PLAN_ID}/batches/1/trigger"
        )
        assert response.status_code == 409
