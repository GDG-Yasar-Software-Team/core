"""Tests for health endpoint."""


class TestHealthEndpoint:
    """Tests for /health endpoint."""

    def test_health_returns_200_without_auth(self, sync_client):
        """Health endpoint is public (no auth required)."""
        response = sync_client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
