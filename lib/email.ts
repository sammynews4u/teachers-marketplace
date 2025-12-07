import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // This is the default testing sender
      to: [to], // In test mode, this MUST be the email you signed up with on Resend
      subject: subject,
      html: html,
    });
    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email failed:", error);
    // We return true anyway so the app doesn't crash if email fails
    return { success: false, error };
  }
}