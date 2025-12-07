import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import logging  

SERVER = "smtp.gmail.com"
PORT = 587

SENDER = "sender_mail_address@gmail.com" 
PASSWORD = "sender_mail_password" 

def send_emails(
        mail_topic: str,
        mail_body: str,
        recievers: list[str]
        ) :  

    fmt1 = "%(asctime)s - %(levelname)s - %(message)s"
    logging.basicConfig(level=logging.INFO,format= fmt1)
    logger = logging.getLogger(__name__)

    file_handler = logging.FileHandler("send_mails.log", encoding="utf-8")
    file_handler.setFormatter(logging.Formatter(fmt1))
    logger.addHandler(file_handler)

    success_count = 0 
    fail_count = 0

    try : 
        logger.info(f"{SERVER}:{PORT}'a bağlaniliyor...")
        with  smtplib.SMTP(SERVER,PORT) as client :  
            logger.info(f"{SERVER}:{PORT}'a bağlanildi!")
            client.starttls()   
            logger.info(f"{SENDER}'a giris yapiliyor...")
            client.login(SENDER,PASSWORD)
            logger.info("Giris basarili!")
            for r in recievers : 
                try :
                    msg = MIMEMultipart() 
                    msg["From"] = SENDER 
                    msg["To"] = r
                    msg["Subject"] = mail_topic
                    msg.attach(MIMEText(mail_body,"plain"))
                    client.sendmail(SENDER,r,msg.as_string())
                    success_count += 1
                    logger.info(f"{r} 'a basarıyla gönderildi")
                except ValueError as ve:
                    logger.error(f"{r}'a gönderilemedi : {str(ve)}")
                    fail_count +=1             
    except ValueError as ve: 
        logger.error(f"{str(ve)}")
    else : 
        logger.info(f"{len(recievers)} deneme, {success_count} basarili, {fail_count} basarisiz")
