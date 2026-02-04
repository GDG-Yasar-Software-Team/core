#!/usr/bin/env python3
"""CLI script for creating and triggering email campaigns."""

import argparse
import asyncio
import sys
from datetime import datetime
from pathlib import Path

# Add services/mail to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "services" / "mail"))

from app.db.mongodb import MongoDB  # noqa: E402
from app.models.campaign import CampaignCreate, ScheduledSend  # noqa: E402
from app.services.campaign_service import CampaignService  # noqa: E402
from app.utils.logger import logger  # noqa: E402


async def main(args: argparse.Namespace) -> None:
    """Main CLI entry point."""
    # Read HTML body from file
    body_path = Path(args.body_file)
    if not body_path.exists():
        logger.error("Body file not found", path=str(body_path))
        sys.exit(1)

    body_html = body_path.read_text(encoding="utf-8")
    if not body_html.strip():
        logger.error("Body file is empty", path=str(body_path))
        sys.exit(1)

    # Parse scheduled times
    scheduled_sends = []
    if args.at:
        for time_str in args.at:
            try:
                # Support ISO format
                scheduled_time = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
                scheduled_sends.append(ScheduledSend(time=scheduled_time))
            except ValueError as e:
                logger.error("Invalid time format", time=time_str, error=str(e))
                sys.exit(1)

    # Connect to MongoDB
    await MongoDB.connect()

    try:
        # Create campaign
        campaign_data = CampaignCreate(
            subject=args.subject,
            body_html=body_html,
            scheduled_sends=scheduled_sends,
            use_custom_subjects=args.custom_subjects,
        )

        campaign_id = await CampaignService.create_campaign(campaign_data)
        logger.success("Campaign created", campaign_id=campaign_id)

        # Trigger immediately if --now flag is set
        if args.now:
            logger.info("Triggering campaign immediately...")
            result = await CampaignService.trigger_now(
                campaign_id=campaign_id,
                unsubscribe_url_base=args.unsubscribe_url or "",
            )
            logger.success(
                "Campaign triggered",
                sent=result.sent_count,
                failed=result.failed_count,
            )
        elif scheduled_sends:
            logger.info(
                "Campaign scheduled",
                times=[str(s.time) for s in scheduled_sends],
            )
        else:
            logger.warning(
                "Campaign created without schedule. Use --now to trigger or --at to schedule."
            )

    finally:
        await MongoDB.close()


def cli() -> None:
    """Parse CLI arguments and run."""
    parser = argparse.ArgumentParser(
        description="Create and trigger email campaigns",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Send immediately
  %(prog)s --subject "Test" --body-file template.html --now

  # Schedule for later
  %(prog)s --subject "Test" --body-file template.html --at "2025-01-20T10:00:00"

  # Multiple schedules
  %(prog)s --subject "Test" --body-file template.html --at "2025-01-20T10:00:00" --at "2025-01-21T14:00:00"
        """,
    )

    parser.add_argument(
        "--subject",
        required=True,
        help="Email subject line",
    )
    parser.add_argument(
        "--body-file",
        required=True,
        help="Path to HTML file with email body",
    )
    parser.add_argument(
        "--at",
        action="append",
        help="Schedule time in ISO format (can be specified multiple times)",
    )
    parser.add_argument(
        "--now",
        action="store_true",
        help="Trigger the campaign immediately instead of scheduling",
    )
    parser.add_argument(
        "--custom-subjects",
        action="store_true",
        help="Enable custom subjects for each scheduled send",
    )
    parser.add_argument(
        "--unsubscribe-url",
        default="",
        help="Base URL for unsubscribe links (e.g., https://mail.gdg.com/unsubscribe)",
    )

    args = parser.parse_args()

    # Validate: must have --now or --at
    if not args.now and not args.at:
        parser.error("Either --now or --at is required")

    asyncio.run(main(args))


if __name__ == "__main__":
    cli()
