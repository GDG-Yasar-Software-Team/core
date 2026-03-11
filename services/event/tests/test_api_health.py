"""Tests for the health check endpoint."""


def test_health_check(sync_client):
    """Test health endpoint returns ok status."""
    response = sync_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
