"""Tests for forms API endpoints."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bson import ObjectId

from tests.helpers import create_async_cursor


class TestCreateFormAPI:
    """Test POST /forms/ endpoint."""

    def test_create_form_success(self, sync_client, mock_mongodb, sample_form_doc):
        """POST /forms/ returns 201 with valid data."""
        mock_mongodb["forms"].insert_one = AsyncMock()
        mock_mongodb["forms"].find_one = AsyncMock(return_value=sample_form_doc)

        response = sync_client.post(
            "/forms/",
            json={
                "title": "Test Form",
                "description": "A test form for unit testing",
                "questions": [
                    {
                        "field_id": "name",
                        "field_type": "text",
                        "label": "Full Name",
                    }
                ],
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Form"

    def test_create_form_validation_error(self, sync_client):
        """POST /forms/ returns 422 for invalid data."""
        response = sync_client.post(
            "/forms/",
            json={
                "title": "",
                "description": "desc",
                "questions": [],
            },
        )

        assert response.status_code == 422


class TestGetFormAPI:
    """Test GET /forms/{form_id} endpoint."""

    def test_get_form_found(self, sync_client, mock_mongodb, sample_form_doc):
        """GET /forms/{id} returns 200 when form exists."""
        mock_mongodb["forms"].find_one = AsyncMock(return_value=sample_form_doc)

        response = sync_client.get("/forms/507f1f77bcf86cd799439011")

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Form"

    def test_get_form_not_found(self, sync_client, mock_mongodb):
        """GET /forms/{id} returns 404 when form does not exist."""
        mock_mongodb["forms"].find_one = AsyncMock(return_value=None)

        response = sync_client.get("/forms/507f1f77bcf86cd799439011")

        assert response.status_code == 404

    def test_get_form_invalid_id(self, sync_client, mock_mongodb):
        """GET /forms/{id} returns 400 for invalid ObjectId."""
        mock_mongodb["forms"].find_one = AsyncMock(
            side_effect=ValueError("Invalid ObjectId")
        )

        response = sync_client.get("/forms/invalid-id")

        assert response.status_code == 400


class TestListFormsAPI:
    """Test GET /forms/ endpoint."""

    def test_list_forms_empty(self, sync_client, mock_mongodb):
        """GET /forms/ returns empty list."""
        mock_mongodb["forms"].count_documents = AsyncMock(return_value=0)
        cursor = create_async_cursor([])
        mock_mongodb["forms"].find = MagicMock(return_value=cursor)

        response = sync_client.get("/forms/")

        assert response.status_code == 200
        data = response.json()
        assert data["forms"] == []
        assert data["total"] == 0

    def test_list_forms_with_results(self, sync_client, mock_mongodb, sample_form_doc):
        """GET /forms/ returns forms with pagination info."""
        mock_mongodb["forms"].count_documents = AsyncMock(return_value=1)
        cursor = create_async_cursor([sample_form_doc])
        mock_mongodb["forms"].find = MagicMock(return_value=cursor)

        response = sync_client.get("/forms/?skip=0&limit=10")

        assert response.status_code == 200
        data = response.json()
        assert len(data["forms"]) == 1
        assert data["total"] == 1


class TestUpdateFormAPI:
    """Test PUT /forms/{form_id} endpoint."""

    def test_update_form_success(self, sync_client, mock_mongodb, sample_form_doc):
        """PUT /forms/{id} returns 200 with updated form."""
        updated_doc = {**sample_form_doc, "title": "Updated Title"}
        mock_mongodb["forms"].find_one_and_update = AsyncMock(return_value=updated_doc)

        response = sync_client.put(
            "/forms/507f1f77bcf86cd799439011",
            json={"title": "Updated Title"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"

    def test_update_form_not_found(self, sync_client, mock_mongodb):
        """PUT /forms/{id} returns 404 when form does not exist."""
        mock_mongodb["forms"].find_one_and_update = AsyncMock(return_value=None)

        response = sync_client.put(
            "/forms/507f1f77bcf86cd799439011",
            json={"title": "Updated"},
        )

        assert response.status_code == 404

    def test_update_form_invalid_id(self, sync_client, mock_mongodb):
        """PUT /forms/{id} returns 400 for invalid ObjectId."""
        mock_mongodb["forms"].find_one_and_update = AsyncMock(
            side_effect=ValueError("Invalid ObjectId")
        )

        response = sync_client.put(
            "/forms/bad-id",
            json={"title": "Updated"},
        )

        assert response.status_code == 400


class TestDeleteFormAPI:
    """Test DELETE /forms/{form_id} endpoint."""

    def test_delete_form_success(self, sync_client, mock_mongodb):
        """DELETE /forms/{id} returns 204 on success."""
        mock_result = MagicMock()
        mock_result.deleted_count = 1
        mock_mongodb["forms"].delete_one = AsyncMock(return_value=mock_result)

        response = sync_client.delete("/forms/507f1f77bcf86cd799439011")

        assert response.status_code == 204

    def test_delete_form_not_found(self, sync_client, mock_mongodb):
        """DELETE /forms/{id} returns 404 when form does not exist."""
        mock_result = MagicMock()
        mock_result.deleted_count = 0
        mock_mongodb["forms"].delete_one = AsyncMock(return_value=mock_result)

        response = sync_client.delete("/forms/507f1f77bcf86cd799439011")

        assert response.status_code == 404

    def test_delete_form_invalid_id(self, sync_client, mock_mongodb):
        """DELETE /forms/{id} returns 400 for invalid ObjectId."""
        mock_mongodb["forms"].delete_one = AsyncMock(
            side_effect=ValueError("Invalid ObjectId")
        )

        response = sync_client.delete("/forms/bad-id")

        assert response.status_code == 400
