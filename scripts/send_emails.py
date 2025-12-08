import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import logging
from dotenv import load_dotenv
import os  

def send_emails(
        mail_topic: str,
        mail_body: str,
        recievers: list[str],
        ) :
    try :     
        # Logging configuration
        format_info = "%(asctime)s - %(levelname)s - %(message)s"
        script_dir = os.path.dirname(os.path.abspath(__file__))
        logging.basicConfig(level=logging.INFO,format=format_info)
        logger = logging.getLogger(__name__)
        file_handler = logging.FileHandler(script_dir + "/send_mails.log")
        file_handler.setFormatter(logging.Formatter(format_info))
        logger.addHandler(file_handler)
    except Exception as e :
        print(f"Logging setup failed: {e}")
        return
    
    try :
        # SMTP server configuration
        env_file_path = script_dir + "/.env"
        logger.info(f"Loading environment variables from {env_file_path}")
        load_dotenv(dotenv_path=env_file_path)
        SMTP_SERVER     = os.getenv("SMTP_SERVER")
        PORT            = os.getenv("PORT")
        SENDER_ADRESS   = os.getenv("SENDER_ADRESS") 
        PASSWORD        = os.getenv("PASSWORD")
        logger.info("Environment variables loaded successfully")
    except Exception as e :
        logger.error(f"Failed to load environment variables: {e}")
        return
    
    try :
         # Establishing connection to the SMTP server
        logger.info(f"Connecting to {SMTP_SERVER}:{PORT}'")
        client = smtplib.SMTP(SMTP_SERVER,PORT)  
        logger.info(f"Success on connecting to {SMTP_SERVER}:{PORT}")
        client.starttls()   
        logger.info(f"Logging in to {SENDER_ADRESS}")
        client.login(SENDER_ADRESS,PASSWORD)
        logger.info("Logged in successfully!")
    except smtplib.SMTPException as e : 
        logger.error(f"SMTP error occurred: {e}")
    else :
        for r in recievers : 
            try :
                # Create and send email
                msg = MIMEMultipart() 
                msg["From"] = SENDER_ADRESS 
                msg["To"] = r
                msg["Subject"] = mail_topic
                msg.attach(MIMEText(mail_body,"plain"))
                client.sendmail(SENDER_ADRESS,r,msg.as_string())
                logger.info(f"Send to {r} successfully!")
            except smtplib.SMTPException as e : 
                logger.error(f"Failed to send {r} : {e}")
        return