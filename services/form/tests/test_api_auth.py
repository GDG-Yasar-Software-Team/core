"""Tests for auth verification endpoint."""


class TestVerifyAdminTokenAPI:
    """Test GET /auth/verify endpoint."""

    def test_verify_token_success(self, sync_client, auth_headers):
        """Valid admin token returns 204 without touching the database."""
        response = sync_client.get("/auth/verify", headers=auth_headers)

        assert response.status_code == 204
        assert response.content == b""

    def test_verify_token_missing_header(self, sync_client):
        """Missing token returns 401."""
        response = sync_client.get("/auth/verify")

        assert response.status_code == 401
        assert response.json() == {"detail": "Missing API token"}

    def test_verify_token_invalid_header(self, sync_client):
        """Invalid token returns 401."""
        response = sync_client.get(
            "/auth/verify",
            headers={"X-API-Token": "bad-token"},
        )

        assert response.status_code == 401
        assert response.json() == {"detail": "Invalid API token"}
