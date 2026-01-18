from pathlib import Path

from scripts.email_sender import send_emails

SCRIPT_DIR = Path(__file__).resolve().parent

mail_body: str = (SCRIPT_DIR / "mails" / "ai-talks-email.html").read_text(
    encoding="utf-8"
)

mail_topic: str = "AI Talks - 26 Aralık 2025"

recipients_path = SCRIPT_DIR / "email_recipients.txt"
recipients = [
    line.strip()
    for line in recipients_path.read_text(encoding="utf-8").splitlines()
    if line.strip()
]

if __name__ == "__main__":
    send_emails(recievers=recipients, mail_body=mail_body, mail_topic=mail_topic)
