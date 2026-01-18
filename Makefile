.PHONY: help format-backend format-frontend format send-emails run-form-backend run-form-frontend

help:
	@echo "Available commands:"
	@echo "  make format-backend     - Format backend code with ruff"
	@echo "  make format-frontend    - Format frontend code with biome"
	@echo "  make format             - Format both backend and frontend"
	@echo "  make run-form-backend   - Run form backend (FastAPI)"
	@echo "  make run-form-frontend  - Run form frontend development server"
	@echo "  make send-emails        - Run email sender script"

format-backend:
	@echo "Formatting backend code..."
	cd services/form && uv run ruff format .
	@echo "Backend formatting complete!"

format-frontend:
	@echo "Formatting frontend code..."
	cd frontend/form && bun run biome check --write .
	@echo "Frontend formatting complete!"

format: format-backend format-frontend
	@echo "All code formatted successfully!"

send-emails:
	@echo "Running email sender script..."
	uv run scripts/send_email_campaign.py
	@echo "Email sending complete!"

run-form-backend:
	@echo "Starting form service..."
	cd services/form && uv run fastapi dev

run-form-frontend:
	@echo "Starting form frontend development server..."
	cd frontend/form && bun dev
