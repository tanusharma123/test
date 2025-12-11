export async function onRequestPost(context) {
    const request = context.request;
    const formData = await request.formData();
    
    const name = formData.get("name");
    const email = formData.get("email");
    const service = formData.get("service");
    const message = formData.get("message");

    // Validate required fields
    if (!name || !email || !service || !message) {
        return new Response(
            JSON.stringify({ success: false, error: "All fields are required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const RESEND_API_KEY = context.env.RESEND_API_KEY;
    const TO_EMAIL = context.env.TO_EMAIL;

    const emailContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Service: ${service}

Message:
${message}
    `.trim();

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "Contact Form <onboarding@resend.dev>",  // Resend's verified sender
                to: [TO_EMAIL],
                reply_to: email,  // User's email for easy replies
                subject: `New Contact Form: ${service}`,
                text: emailContent,
                html: `
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Service:</strong> ${service}</p>
                    <h3>Message:</h3>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                `
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Resend API error:", error);
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: "Failed to send email. Please try again." 
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const data = await response.json();
        console.log("Email sent successfully:", data.id);

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: "Thank you! Your message has been sent." 
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        console.error("Error sending email:", err);
        return new Response(
            JSON.stringify({ 
                success: false, 
                error: "Server error. Please try again later." 
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}