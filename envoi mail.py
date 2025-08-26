import smtplib
from email.mime.text import MIMEText

msg = MIMEText("Ceci est un test.")
msg["Subject"] = "Test OVH SMTP"
msg["From"] = "contact@fairplay.video"
msg["To"] = "contact.newstreamteam@gmail.com"

with smtplib.SMTP("ssl0.ovh.net", 587) as server:
    server.starttls()
    server.login("contact@fairplay.video", 
    server.send_message(msg)
