import os
import random
import smtplib
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv
from tamga import Tamga


def send_emails(
    mail_topic: str,
    mail_body: str,
    recievers: list[str],
):
    start_time = time.time()

    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        logger = Tamga(
            file_output=True,
            file_path=script_dir + "/send_mails.log",
        )
    except Exception as e:
        print(f"Logging setup failed: {e}")
        return

    try:
        env_file_path = script_dir + "/.env"
        load_dotenv(dotenv_path=env_file_path)

        SMTP_SERVER = os.getenv("SMTP_SERVER")
        PORT = int(os.getenv("PORT"))
        SENDER_ADRESS = os.getenv("SENDER_ADRESS")
        PASSWORD = os.getenv("PASSWORD")
    except Exception as e:
        logger.error("Failed to load environment variables", error=str(e))
        return

    try:
        client = smtplib.SMTP(SMTP_SERVER, PORT)
        client.starttls()
        client.login(SENDER_ADRESS, PASSWORD)
        logger.info("SMTP connection established")
    except smtplib.SMTPException as e:
        logger.error("SMTP connection failed", error=str(e))
        return

    logger.info("Starting email batch", total_recipients=len(recievers))

    failed_users = []
    for i, r in enumerate(recievers):
        try:
            msg = MIMEMultipart()
            msg["From"] = SENDER_ADRESS
            msg["To"] = r
            msg["Subject"] = mail_topic
            msg.attach(MIMEText(mail_body, "html"))

            client.sendmail(SENDER_ADRESS, r, msg.as_string())
            logger.success("Email sent", recipient=r)

            if i < len(recievers) - 1:
                time.sleep(random.uniform(2, 6))
        except smtplib.SMTPException as e:
            logger.error("Failed to send email", recipient=r, error=str(e))
            failed_users.append(r)

    end_time = time.time()
    total_duration = end_time - start_time
    total_sent = len(recievers) - len(failed_users)

    if failed_users:
        logger.warning(
            "Email batch completed with failures",
            total_sent=total_sent,
            total_failed=len(failed_users),
            failed_recipients=failed_users,
        )
    else:
        logger.success("Email batch completed successfully", total_sent=total_sent)

    logger.info(
        "Execution summary",
        duration=f"{int(total_duration // 60)}m {int(total_duration % 60)}s",
        sent=f"{total_sent}/{len(recievers)}",
    )

    client.quit()
