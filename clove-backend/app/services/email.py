import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import aiosmtplib
from jinja2 import Template

from app.core.config import settings


class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAILS_FROM_EMAIL
        self.from_name = settings.EMAILS_FROM_NAME

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send an email using aiosmtplib (async)"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email

            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                start_tls=True,
                username=self.smtp_user,
                password=self.smtp_password,
            )
            
            print(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            print(f"Failed to send email to {to_email}: {e}")
            return False

    async def send_verification_email(self, to_email: str, verification_link: str, user_name: str) -> bool:
        """Send email verification email"""
        subject = "Verify your CLOVE email address"
        
        html_template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌟 Welcome to CLOVE!</h1>
                </div>
                <div class="content">
                    <h2>Hi {{ user_name }}!</h2>
                    <p>Thank you for signing up for CLOVE Learning Platform. We're excited to have you on board!</p>
                    <p>To complete your registration and start your learning journey, please verify your email address by clicking the button below:</p>
                    
                    <div style="text-align: center;">
                        <a href="{{ verification_link }}" class="button">Verify Email Address</a>
                    </div>
                    
                    <p>This verification link will expire in 6 hours for security reasons.</p>
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px;">{{ verification_link }}</p>
                    
                    <p>If you didn't create an account with CLOVE, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>Happy Learning!<br>The CLOVE Team</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        text_template = Template("""
        Hi {{ user_name }}!

        Welcome to CLOVE Learning Platform!

        Please verify your email address by visiting this link:
        {{ verification_link }}

        This link will expire in 6 hours.

        If you didn't create an account with CLOVE, you can safely ignore this email.

        Happy Learning!
        The CLOVE Team
        """)
        
        html_content = html_template.render(user_name=user_name, verification_link=verification_link)
        text_content = text_template.render(user_name=user_name, verification_link=verification_link)
        
        return await self.send_email(to_email, subject, html_content, text_content)

    async def send_password_reset_email(self, to_email: str, reset_link: str, user_name: str) -> bool:
        """Send password reset email"""
        subject = "Reset your CLOVE password"
        
        html_template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔒 Password Reset Request</h1>
                </div>
                <div class="content">
                    <h2>Hi {{ user_name }}!</h2>
                    <p>We received a request to reset your password for your CLOVE account.</p>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                    </div>
                    
                    <p>To reset your password, click the button below:</p>
                    
                    <div style="text-align: center;">
                        <a href="{{ reset_link }}" class="button">Reset Password</a>
                    </div>
                    
                    <p>This reset link will expire in 6 hours for security reasons.</p>
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px;">{{ reset_link }}</p>
                    
                    <p>After clicking the link, you'll be able to create a new password for your account.</p>
                </div>
                <div class="footer">
                    <p>Stay secure!<br>The CLOVE Team</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        text_template = Template("""
        Hi {{ user_name }}!

        We received a request to reset your password for your CLOVE account.

        If you didn't request this, please ignore this email.

        To reset your password, visit this link:
        {{ reset_link }}

        This link will expire in 6 hours.

        Stay secure!
        The CLOVE Team
        """)
        
        html_content = html_template.render(user_name=user_name, reset_link=reset_link)
        text_content = text_template.render(user_name=user_name, reset_link=reset_link)
        
        return await self.send_email(to_email, subject, html_content, text_content)


# Create a global instance
email_service = EmailService() 