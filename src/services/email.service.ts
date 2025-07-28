import nodemailer from 'nodemailer';
import { env } from '../config/env.config';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: env.SMTP_FROM,
        to: email,
        subject: '🚀 Welcome to NS Computers!',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <!-- Header with Gradient Background -->
            <div style="background: linear-gradient(135deg, #ff4d4d, #ff1a1a); padding: 20px 15px; text-align: center; width: 100%; box-sizing: border-box;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600; line-height: 1.3;">
                <span style="font-size: 28px; display: block; margin-bottom: 5px;">🖥️</span>
                NS-<span style="color: #ffeb3b;">Computers</span>
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0; font-size: 14px; line-height: 1.4;">Your Trusted Technology Partner</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 20px 15px; background: #ffffff; box-sizing: border-box; width: 100%;">
              <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 20px; line-height: 1.4;">👋 Welcome Aboard, ${name}!</h2>
              
              <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 15px 0;">
                Thank you for joining the NS-Computers family! We're thrilled to have you with us. 🎉
              </p>
              
              <div style="background: #f8f9ff; border-radius: 8px; padding: 15px; margin: 20px 0; box-sizing: border-box; width: 100%;">
                <h3 style="color: #1a1a1a; margin: 0 0 12px 0; font-size: 17px; line-height: 1.4;">🌟 Welcome to NS Computers! 🌟</h3>
                <p style="margin: 0 0 12px 0; color: #333; font-size: 14px; line-height: 1.5;">
                  At NS Computers, we're passionate about bringing you the latest in technology and computing solutions. 
                  From high-performance gaming rigs 💻 to powerful workstations, we've got you covered!
                </p>
                <p style="margin: 0 0 8px 0; color: #333; font-size: 15px; font-weight: 600;">
                  🚀 Why choose us?
                </p>
                <ul style="margin: 0 0 0 15px; padding: 0; color: #333; font-size: 14px; line-height: 1.6;">
                  <li style="margin-bottom: 6px;">🛒 Wide selection of top-brand computers and accessories</li>
                  <li style="margin-bottom: 6px;">⚡ Lightning-fast delivery to your doorstep</li>
                  <li style="margin-bottom: 6px;">🔒 Secure shopping with multiple payment options</li>
                  <li style="margin-bottom: 6px;">🛠️ Expert technical support and warranty services</li>
                  <li>💰 Exclusive member-only deals and discounts</li>
                </ul>
              </div>
              
              <div style="background: #fff8f8; border-left: 4px solid #ff4d4d; padding: 12px 15px; margin: 20px 0; border-radius: 0 4px 4px 0; box-sizing: border-box; width: 100%;">
                <p style="margin: 0; color: #333; font-style: italic; font-size: 14px; line-height: 1.5;">
                  💡 <strong>Pro Tip:</strong> Complete your profile to get personalized recommendations and exclusive offers!
                </p>
              </div>
              
              <div style="text-align: center; margin: 25px 0; width: 100%;">
                <a href="${env.CORS_ORIGIN}" 
                   style="display: inline-block; background: #ff1a1a; color: white; 
                          padding: 12px 25px; text-decoration: none; border-radius: 4px; 
                          font-weight: 600; font-size: 15px; text-transform: uppercase;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 90%; max-width: 280px;
                          box-sizing: border-box; margin: 0 auto;">
                  🛍️ Start Shopping Now
                </a>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 5px 0;">
                Need help? Our support team is here for you at 
                <a href="mailto:support@nscomputers.com" style="color: #ff1a1a; text-decoration: none; word-break: break-all;">
                  support@nscomputers.com
                </a> 📧
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 13px; color: #777777; border-top: 1px solid #eeeeee; box-sizing: border-box; width: 100%;">
              <div style="margin-bottom: 10px; line-height: 1.8;">
                <a href="${env.CORS_ORIGIN}/about" style="color: #ff1a1a; text-decoration: none; margin: 0 8px; display: inline-block;">About Us</a>
                <span style="color: #dddddd; margin: 0 5px;">•</span>
                <a href="${env.CORS_ORIGIN}/products" style="color: #ff1a1a; text-decoration: none; margin: 0 8px; display: inline-block;">Products</a>
                <span style="color: #dddddd; margin: 0 5px;">•</span>
                <a href="${env.CORS_ORIGIN}/contact" style="color: #ff1a1a; text-decoration: none; margin: 0 8px; display: inline-block;">Contact</a>
              </div>
              <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.4;">
                © ${new Date().getFullYear()} NS-Computers. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #aaaaaa; line-height: 1.4;">
                You're receiving this email because you signed up for an NS-Computers account.
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
