import emailjs from '@emailjs/browser';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    const templateParams = {
      to_email: to,
      subject,
      message: text || html,
    };

    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const templateParams = {
      to_email: email,
      subject: 'Welcome to Ecowatt!',
      name,
      message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Thank you for choosing Ecowatt!</h2>
          <p>Dear ${name},</p>
          <p>Welcome to Ecowatt! We're excited to have you on board.</p>
          <p>Your account has been successfully set up. You can now:</p>
          <ul>
            <li>Monitor your energy consumption</li>
            <li>Track your solar power generation</li>
            <li>Get personalized energy-saving recommendations</li>
            <li>Receive alerts about your energy usage</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The Ecowatt Team</p>
        </div>
      `,
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendTariffAlertEmail = async (email: string, name: string, currentTariff: number) => {
  try {
    const templateParams = {
      to_email: email,
      subject: 'High Energy Consumption Alert',
      name,
      message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">High Energy Consumption Alert</h2>
          <p>Dear ${name},</p>
          <p>We noticed that your current tariff rate has exceeded 4 kW/h.</p>
          <p>Current tariff rate: ${currentTariff.toFixed(2)} kW/h</p>
          <p>To optimize your energy consumption and reduce costs, consider:</p>
          <ul>
            <li>Using appliances during off-peak hours</li>
            <li>Checking your solar power generation</li>
            <li>Reviewing your energy consumption patterns</li>
          </ul>
          <p>You can view detailed recommendations in your Ecowatt dashboard.</p>
          <p>Best regards,<br>The Ecowatt Team</p>
        </div>
      `,
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );
  } catch (error) {
    console.error('Error sending tariff alert email:', error);
  }
}; 