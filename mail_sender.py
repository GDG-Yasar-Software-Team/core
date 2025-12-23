from emails import emails
from scripts.send_emails import send_emails

with open("scripts/mails/ai-talks-email.html", "r", encoding="utf-8") as f:
    mail_body: str = f.read()

mail_topic: str = "AI Talks - 26 Aralık 2025"


if __name__ == "__main__":
    send_emails(recievers=emails, mail_body=mail_body, mail_topic=mail_topic)
