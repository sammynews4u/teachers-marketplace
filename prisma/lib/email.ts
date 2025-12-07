import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const data = await resend.emails.send({
      from: 'TeachersB <onboarding@resend.dev>', // Change this once you verify a domain
      to: [to],
      subject: subject,
      html: html,
    });
    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email failed:", error);
    return { success: false, error };
  }
}