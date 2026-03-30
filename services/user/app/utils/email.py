def normalize_email(email: str) -> str:
    """Normalize email values for consistent storage and lookups."""
    return email.strip().lower()
