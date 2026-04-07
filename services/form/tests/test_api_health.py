"""Tests for health endpoint."""

from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient


class TestHealthEndpoint:
    """Test the health check endpoint."""

    def test_health_check(self, sync_client):
        """Test GET /health returns 200 with status ok."""
        response = sync_client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    def test_health_check_does_not_require_database_startup(self):
        """GET /health stays healthy even if MongoDB is unavailable."""
        from app.main import app

        with patch(
            "app.db.mongodb.MongoDB.connect",
            new=AsyncMock(side_effect=RuntimeError("db down")),
        ) as connect_mock:
            with patch("app.db.mongodb.MongoDB.close", new_callable=AsyncMock):
                with TestClient(app) as client:
                    response = client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
        connect_mock.assert_not_awaited()
