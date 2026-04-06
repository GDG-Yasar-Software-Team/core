"""Tests for campaigns API endpoints."""

from unittest.mock import AsyncMock, MagicMock, patch

from bson import ObjectId

from tests.conftest import create_async_cursor


class TestPostCampaigns:
    """Tests for POST /campaigns/ endpoint."""

    def test_with_json_body_creates_campaign(self, sync_client, mock_mongodb):
        """Should create campaign with JSON body."""
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId("507f1f77bcf86cd799439020"))
        )

        response = sync_client.post(
            "/campaigns/",
            json={
                "subject": "Test Campaign",
                "body_html": "<h1>Hello</h1>",
                "scheduled_sends": [],
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["status"] == "scheduled"

    def test_returns_campaign_id(self, sync_client, mock_mongodb):
        """Should return campaign ID in response."""
        expected_id = ObjectId("507f1f77bcf86cd799439020")
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=expected_id)
        )

        response = sync_client.post(
            "/campaigns/",
            json={
                "subject": "Test",
                "body_html": "<p>Content</p>",
            },
        )

        assert response.json()["id"] == str(expected_id)

    def test_validates_required_fields(self, sync_client, mock_mongodb):
        """Should return 422 if subject missing."""
        response = sync_client.post(
            "/campaigns/",
            json={
                "body_html": "<p>Content</p>",
            },
        )

        assert response.status_code == 422

    def test_rejects_empty_body_html(self, sync_client, mock_mongodb):
        """Should return 422 if body_html empty."""
        response = sync_client.post(
            "/campaigns/",
            json={
                "subject": "Test",
                "body_html": "",
            },
        )

        assert response.status_code == 422

    def test_accepts_scheduled_sends(self, sync_client, mock_mongodb):
        """Should accept scheduled_sends list."""
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId())
        )

        response = sync_client.post(
            "/campaigns/",
            json={
                "subject": "Test",
                "body_html": "<p>Content</p>",
                "scheduled_sends": [
                    {"time": "2025-01-20T10:00:00"},
                    {"time": "2025-01-21T14:00:00", "subject": "Reminder"},
                ],
                "use_custom_subjects": True,
            },
        )

        assert response.status_code == 201

    def test_with_form_data(self, sync_client, mock_mongodb):
        """Should create campaign with form data."""
        mock_mongodb["campaigns"].insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId())
        )

        response = sync_client.post(
            "/campaigns/",
            data={
                "subject": "Test Campaign",
                "body_html": "<h1>Hello</h1>",
                "scheduled_sends": "[]",
            },
        )

        assert response.status_code == 201


class TestPutCampaigns:
    """Tests for PUT /campaigns/{id} endpoint."""

    def test_updates_subject(self, sync_client, mock_mongodb, sample_campaign_doc):
        """Should update campaign subject."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        response = sync_client.put(
            "/campaigns/507f1f77bcf86cd799439020",
            json={"subject": "Updated Subject"},
        )

        assert response.status_code == 200

    def test_404_for_missing_campaign(self, sync_client, mock_mongodb):
        """Should return 404 for nonexistent campaign."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=None)

        response = sync_client.put(
            "/campaigns/507f1f77bcf86cd799439099",
            json={"subject": "Updated"},
        )

        assert response.status_code == 404

    def test_cannot_update_completed_campaign(
        self, sync_client, mock_mongodb, sample_campaign_doc
    ):
        """Should return 409 when updating completed campaign."""
        sample_campaign_doc["status"] = "completed"
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)

        response = sync_client.put(
            "/campaigns/507f1f77bcf86cd799439020",
            json={"subject": "Updated"},
        )

        assert response.status_code == 409


class TestTriggerCampaign:
    """Tests for POST /campaigns/{id}/trigger endpoint."""

    def test_triggers_campaign(self, sync_client, mock_mongodb, sample_campaign_doc):
        """Should trigger campaign and return result."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)
        mock_mongodb["campaigns"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        with patch(
            "app.services.campaign_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=[],
        ):
            response = sync_client.post("/campaigns/507f1f77bcf86cd799439020/trigger")

        assert response.status_code == 202
        data = response.json()
        assert "campaign_id" in data
        assert "total_recipients" in data
        assert data["status"] == "in_progress"

    def test_404_for_missing_campaign(self, sync_client, mock_mongodb):
        """Should return 404 for nonexistent campaign."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=None)

        response = sync_client.post("/campaigns/507f1f77bcf86cd799439099/trigger")

        assert response.status_code == 404

    def test_returns_409_when_already_in_progress(
        self, sync_client, mock_mongodb, sample_campaign_doc
    ):
        """Should reject duplicate trigger while in progress."""
        sample_campaign_doc["status"] = "in_progress"
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)

        response = sync_client.post("/campaigns/507f1f77bcf86cd799439020/trigger")

        assert response.status_code == 409


class TestRecipientPreview:
    """Tests for GET /campaigns/recipient-preview endpoint."""

    def test_returns_recipient_preview(self, sync_client):
        """Should return recipient count and ETA data."""
        with patch(
            "app.services.campaign_service.UserServiceClient.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=["a@example.com", "b@example.com"],
        ):
            response = sync_client.get("/campaigns/recipient-preview")

        assert response.status_code == 200
        data = response.json()
        assert data["total_recipients"] == 2
        assert "estimated_seconds" in data
        assert "estimated_minutes" in data


class TestGetCampaignProgress:
    """Tests for GET /campaigns/{id}/progress endpoint."""

    def test_returns_progress_with_active_execution(
        self, sync_client, mock_mongodb, sample_campaign_doc
    ):
        """Should return current progress when campaign has active progress."""
        sample_campaign_doc["current_progress"] = {
            "total_recipients": 100,
            "sent_count": 50,
            "failed_count": 2,
            "started_at": "2025-01-20T10:00:00",
            "is_complete": False,
        }
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)

        response = sync_client.get("/campaigns/507f1f77bcf86cd799439020/progress")

        assert response.status_code == 200
        data = response.json()
        assert data["total_recipients"] == 100
        assert data["sent_count"] == 50
        assert data["failed_count"] == 2
        assert data["is_complete"] is False

    def test_returns_last_execution_when_no_progress(
        self, sync_client, mock_mongodb, sample_campaign_doc
    ):
        """Should return completed progress from last execution when no active progress."""
        sample_campaign_doc["executions"] = [
            {
                "scheduled_time": None,
                "subject_used": "Test",
                "started_at": "2025-01-20T10:00:00",
                "completed_at": "2025-01-20T10:30:00",
                "sent_count": 95,
                "failed_count": 5,
                "recipient_emails": [],
                "failed_emails": [],
                "is_manual_trigger": True,
            }
        ]
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)

        response = sync_client.get("/campaigns/507f1f77bcf86cd799439020/progress")

        assert response.status_code == 200
        data = response.json()
        assert data["total_recipients"] == 100
        assert data["sent_count"] == 95
        assert data["is_complete"] is True

    def test_404_for_missing_campaign(self, sync_client, mock_mongodb):
        """Should return 404 for nonexistent campaign."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=None)

        response = sync_client.get("/campaigns/507f1f77bcf86cd799439099/progress")

        assert response.status_code == 404


class TestGetCampaign:
    """Tests for GET /campaigns/{id} endpoint."""

    def test_returns_campaign_details(
        self, sync_client, mock_mongodb, sample_campaign_doc
    ):
        """Should return campaign details."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=sample_campaign_doc)

        response = sync_client.get("/campaigns/507f1f77bcf86cd799439020")

        assert response.status_code == 200
        data = response.json()
        assert data["subject"] == "Test Campaign"
        assert "body_html" in data
        assert "executions" in data

    def test_404_for_missing(self, sync_client, mock_mongodb):
        """Should return 404 for nonexistent campaign."""
        mock_mongodb["campaigns"].find_one = AsyncMock(return_value=None)

        response = sync_client.get("/campaigns/507f1f77bcf86cd799439099")

        assert response.status_code == 404


class TestListCampaigns:
    """Tests for GET /campaigns/ endpoint."""

    def test_returns_recent_campaigns(
        self, sync_client, mock_mongodb, sample_campaign_doc
    ):
        """Should return list of recent campaigns."""
        mock_cursor = create_async_cursor([sample_campaign_doc])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        response = sync_client.get("/campaigns/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1

    def test_respects_limit_param(self, sync_client, mock_mongodb):
        """Should respect limit parameter."""
        mock_cursor = create_async_cursor([])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        response = sync_client.get("/campaigns/?limit=5")

        assert response.status_code == 200

    def test_empty_when_no_campaigns(self, sync_client, mock_mongodb):
        """Should return empty list when no campaigns."""
        mock_cursor = create_async_cursor([])
        mock_mongodb["campaigns"].find = MagicMock(return_value=mock_cursor)

        response = sync_client.get("/campaigns/")

        assert response.status_code == 200
        assert response.json() == []
