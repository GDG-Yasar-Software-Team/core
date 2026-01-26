"""Tests for health check endpoint."""


class TestHealthEndpoint:
    """Tests for GET /health endpoint."""

    def test_returns_ok(self, sync_client, mock_mongodb):
        """Should return 200 with status ok."""
        response = sync_client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
