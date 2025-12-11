export async function onRequestPost(context) {
    const request = context.request;
    const formData = await request.formData();
    
    const name = formData.get("name");
    const email = formData.get("email");
    const service = formData.get("service");
    const message = formData.get("message");

    const RESEND_API_KEY = context.env.RESEND_API_KEY;
    const TO_EMAIL = context.env.TO_EMAIL;

    // Debug: Check if env variables exist
    if (!RESEND_API_KEY) {
        return new Response(
            JSON.stringify({ success: false, error: "RESEND_API_KEY not set" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    if (!TO_EMAIL) {
        return new Response(
            JSON.stringify({ success: false, error: "TO_EMAIL not set" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

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
                from: "Contact Form <onboarding@resend.dev>",
                to: [TO_EMAIL],
                reply_to: email,
                subject: `New Contact Form: ${service}`,
                text: emailContent
            })
        });

        const responseText = await response.text();
        
        // Return the actual error for debugging
        if (!response.ok) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: responseText,
                    status: response.status
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: "Email sent successfully!" 
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        return new Response(
            JSON.stringify({ 
                success: false, 
                error: err.message,
                stack: err.stack
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}