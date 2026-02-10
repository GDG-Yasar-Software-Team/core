"""Tests for health endpoint."""


class TestHealthEndpoint:
    """Tests for /health endpoint."""

    def test_health_returns_200_without_auth(self, sync_client):
        """Health endpoint is public (no auth required)."""
        response = sync_client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    def test_health_has_cors_headers_for_local_frontend(self, sync_client):
        """CORS preflight allows local frontend origin."""
        response = sync_client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )

        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == (
            "http://localhost:3000"
        )
