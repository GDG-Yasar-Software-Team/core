"""Tests for health endpoint."""


class TestHealthEndpoint:
    """Test the health check endpoint."""

    def test_health_check(self, sync_client):
        """Test GET /health returns 200 with status ok."""
        response = sync_client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
