"""Tests for submissions API endpoints."""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch


from tests.helpers import SAMPLE_FORM_ID, SAMPLE_SUBMISSION_ID, create_async_cursor


def _make_active_form_doc():
    """Create an active form document for submission validation."""
    return {
        "_id": SAMPLE_FORM_ID,
        "title": "Test Form",
        "description": "A test form",
        "questions": [
            {
                "field_id": "q1",
                "field_type": "text",
                "label": "Question",
                "placeholder": None,
                "required": True,
                "options": None,
                "validation": None,
            }
        ],
        "start_date": None,
        "deadline": None,
        "is_active": True,
        "created_at": datetime(2025, 6, 15, 12, 0, 0),
        "updated_at": None,
        "view_count": 0,
        "submission_count": 0,
    }


class TestCreateSubmissionAPI:
    """Test POST /submissions/ endpoint."""

    def test_create_submission_success(
        self, sync_client, mock_mongodb, sample_submission_doc
    ):
        """POST /submissions/ returns 201 with valid data."""
        form_doc = _make_active_form_doc()
        mock_mongodb["forms"].find_one = AsyncMock(return_value=form_doc)
        mock_mongodb["submissions"].insert_one = AsyncMock()
        mock_mongodb["forms"].update_one = AsyncMock()

        with patch(
            "app.services.submission_service.MongoDB.get_db",
            return_value=mock_mongodb["db"],
        ):
            response = sync_client.post(
                "/submissions/",
                json={
                    "form_id": str(SAMPLE_FORM_ID),
                    "answers": {"q1": "answer"},
                    "respondent_email": "test@example.com",
                },
            )

        assert response.status_code == 201
        data = response.json()
        assert data["respondent_email"] == "test@example.com"

    def test_create_submission_form_not_found(self, sync_client, mock_mongodb):
        """POST /submissions/ returns 404 when form does not exist."""
        mock_mongodb["forms"].find_one = AsyncMock(return_value=None)

        with patch(
            "app.services.submission_service.MongoDB.get_db",
            return_value=mock_mongodb["db"],
        ):
            response = sync_client.post(
                "/submissions/",
                json={
                    "form_id": str(SAMPLE_FORM_ID),
                    "answers": {"q1": "answer"},
                    "respondent_email": "test@example.com",
                },
            )

        assert response.status_code == 404

    def test_create_submission_form_inactive(self, sync_client, mock_mongodb):
        """POST /submissions/ returns 400 when form is inactive."""
        form_doc = _make_active_form_doc()
        form_doc["is_active"] = False
        mock_mongodb["forms"].find_one = AsyncMock(return_value=form_doc)

        with patch(
            "app.services.submission_service.MongoDB.get_db",
            return_value=mock_mongodb["db"],
        ):
            response = sync_client.post(
                "/submissions/",
                json={
                    "form_id": str(SAMPLE_FORM_ID),
                    "answers": {"q1": "answer"},
                    "respondent_email": "test@example.com",
                },
            )

        assert response.status_code == 400

    def test_create_submission_invalid_form_id(self, sync_client, mock_mongodb):
        """POST /submissions/ returns 422 for invalid form ID format."""
        response = sync_client.post(
            "/submissions/",
            json={
                "form_id": "not-valid",
                "answers": {"q1": "answer"},
                "respondent_email": "test@example.com",
            },
        )

        assert response.status_code == 422

    def test_create_submission_missing_visible_conditional_field(
        self, sync_client, mock_mongodb
    ):
        """POST /submissions/ returns 400 when required conditional answer is missing."""
        form_doc = _make_active_form_doc()
        form_doc["questions"] = [
            {
                "field_id": "is_yasar_student",
                "field_type": "radio",
                "label": "Yaşar Üniversitesi öğrencisi misiniz?",
                "placeholder": None,
                "required": True,
                "options": ["Evet", "Hayır"],
                "validation": None,
                "condition": None,
            },
            {
                "field_id": "turkish_identity_number",
                "field_type": "text",
                "label": "TC Kimlik Numarası",
                "placeholder": None,
                "required": True,
                "options": None,
                "validation": None,
                "condition": {
                    "depends_on": "is_yasar_student",
                    "values": ["Hayır"],
                },
            },
        ]
        mock_mongodb["forms"].find_one = AsyncMock(return_value=form_doc)

        with patch(
            "app.services.submission_service.MongoDB.get_db",
            return_value=mock_mongodb["db"],
        ):
            response = sync_client.post(
                "/submissions/",
                json={
                    "form_id": str(SAMPLE_FORM_ID),
                    "answers": {"is_yasar_student": "Hayır"},
                    "respondent_email": "test@example.com",
                },
            )

        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "required_answer_incomplete"


class TestGetSubmissionAPI:
    """Test GET /submissions/{submission_id} endpoint."""

    def test_get_submission_found(
        self, sync_client, mock_mongodb, sample_submission_doc, auth_headers
    ):
        """GET /submissions/{id} returns 200 when submission exists."""
        mock_mongodb["submissions"].find_one = AsyncMock(
            return_value=sample_submission_doc
        )

        with patch(
            "app.services.submission_service.MongoDB.get_db",
            return_value=mock_mongodb["db"],
        ):
            response = sync_client.get(f"/submissions/{SAMPLE_SUBMISSION_ID}", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["respondent_email"] == "john@example.com"

    def test_get_submission_not_found(self, sync_client, mock_mongodb, auth_headers):
        """GET /submissions/{id} returns 404 when submission does not exist."""
        mock_mongodb["submissions"].find_one = AsyncMock(return_value=None)

        with patch(
            "app.services.submission_service.MongoDB.get_db",
            return_value=mock_mongodb["db"],
        ):
            response = sync_client.get(f"/submissions/{SAMPLE_SUBMISSION_ID}", headers=auth_headers)

        assert response.status_code == 404

    def test_get_submission_invalid_id(self, sync_client, mock_mongodb, auth_headers):
        """GET /submissions/{id} returns 400 for invalid ObjectId."""
        with patch(
            "app.services.submission_service.MongoDB.get_db",
            return_value=mock_mongodb["db"],
        ):
            response = sync_client.get("/submissions/bad-id", headers=auth_headers)

        assert response.status_code == 400


class TestGetSubmissionsByFormAPI:
    """Test GET /submissions/by-form/{form_id} endpoint."""

    def test_get_submissions_by_form(
        self, sync_client, mock_mongodb, sample_submission_doc, auth_headers
    ):
        """GET /submissions/by-form/{form_id} returns paginated results."""
        mock_mongodb["submissions"].count_documents = AsyncMock(return_value=1)
        cursor = create_async_cursor([sample_submission_doc])
        mock_mongodb["submissions"].find = MagicMock(return_value=cursor)

        with patch(
            "app.services.submission_service.MongoDB.get_db",
            return_value=mock_mongodb["db"],
        ):
            response = sync_client.get(f"/submissions/by-form/{SAMPLE_FORM_ID}", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["submissions"]) == 1

    def test_get_submissions_by_form_invalid_id(self, sync_client, mock_mongodb, auth_headers):
        """GET /submissions/by-form/{form_id} returns 400 for invalid form ID."""
        with patch(
            "app.services.submission_service.MongoDB.get_db",
            return_value=mock_mongodb["db"],
        ):
            response = sync_client.get("/submissions/by-form/bad-id", headers=auth_headers)

        assert response.status_code == 400
