import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const brevoClient = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key': process.env.BREVO_API_KEY,
    'Content-Type': 'application/json',
  },
});

export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const emailData = {
      sender: {
        name: 'YSJ Portal',
        email: process.env.MAIL_FROM,
      },
      to: [
        {
          email: email,
          name: userName,
        },
      ],
      subject: 'Password Reset Request - YSJ Application Portal',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #2196F3; margin: 0;">Password Reset Request</h2>
          </div>
          
          <p>Hello ${userName},</p>
          
          <p>We received a request to reset your password for your YSJ Application Portal account. If you did not make this request, you can ignore this email.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Your Password
            </a>
          </div>
          
          <p style="font-size: 12px; color: #666;">
            Or copy and paste this link in your browser:<br>
            <span style="word-break: break-all;">${resetURL}</span>
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This password reset link will expire in 1 hour.<br>
            If you did not request a password reset, please contact our support team immediately.
          </p>
          
          <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; text-align: center; color: #999; font-size: 11px;">
            <p>© 2024 Youth Science Journal (YSJ). All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `
        Password Reset Request
        
        Hello ${userName},
        
        We received a request to reset your password. Click the link below or copy it to your browser:
        
        ${resetURL}
        
        This link will expire in 1 hour.
        
        If you did not request this, please ignore this email.
      `,
    };

    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const response = await brevoClient.post('/smtp/email', emailData);
    console.log('Email sent via Brevo API:', response.data);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('Brevo API error:', error.response?.data || error.message);
    throw new Error('Failed to send password reset email: ' + (error.response?.data?.message || error.message));
  }
};

export const sendVerificationEmail = async (email, verificationToken, userName) => {
  try {
    const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const emailData = {
      sender: {
        name: 'YSJ Portal',
        email: process.env.MAIL_FROM,
      },
      to: [
        {
          email: email,
          name: userName,
        },
      ],
      subject: 'Verify Your Email - YSJ Application Portal',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #2196F3; margin: 0;">Email Verification</h2>
          </div>
          
          <p>Hello ${userName},</p>
          
          <p>Welcome to the YSJ Application Portal! Please verify your email address to activate your account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyURL}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          <p style="font-size: 12px; color: #666;">
            Or copy and paste this link in your browser:<br>
            <span style="word-break: break-all;">${verifyURL}</span>
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This verification link will expire in 24 hours.
          </p>
          
          <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; text-align: center; color: #999; font-size: 11px;">
            <p>© 2024 Youth Science Journal (YSJ). All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `
        Email Verification
        
        Hello ${userName},
        
        Welcome to the YSJ Application Portal! Click the link below to verify your email:
        
        ${verifyURL}
        
        This link will expire in 24 hours.
      `,
    };

    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const response = await brevoClient.post('/smtp/email', emailData);
    console.log('Verification email sent via Brevo API:', response.data);
    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Brevo API error:', error.response?.data || error.message);
    throw new Error('Failed to send verification email: ' + (error.response?.data?.message || error.message));
  }
};
