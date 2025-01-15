import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, serviceType, description, preferredTime } = await req.json();

    // Log form contents
    console.log('New service request received:');
    console.log({
      name,
      email,
      serviceType,
      description,
      preferredTime
    });

    const { data, error } = await resend.emails.send({
      from: 'Friends for Cheaper <onboarding@resend.dev>',
      to: process.env.NOTIFICATION_EMAIL as string,
      replyTo: email,
      subject: `New Service Request from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Service Type: ${serviceType}
        Preferred Time: ${preferredTime}
        
        Description:
        ${description}
      `,
      html: `
        <h2>New Service Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Service Type:</strong> ${serviceType}</p>
        <p><strong>Preferred Time:</strong> ${preferredTime}</p>
        <p><strong>Description:</strong></p>
        <p>${description}</p>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to send email. Please try again later.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 