export async function onRequestPost(context) {
    const request = context.request;

    const formData = await request.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const service = formData.get("service");
    const message = formData.get("message");

    const TO_EMAIL = context.env.TO_EMAIL;       // Receiver (your Gmail)
    const FROM_EMAIL = context.env.FROM_EMAIL;   // Verified sender domain

    const emailContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Service: ${service}

Message:
${message}
    `;

    const mailData = {
        personalizations: [
            {
                to: [{ email: TO_EMAIL }],
                reply_to: [{ email }]
            }
        ],
        from: { email: FROM_EMAIL, name: "Website Contact Form" },
        subject: "New Contact Form Submission",
        content: [
            {
                type: "text/plain",
                value: emailContent
            }
        ]
    };

    const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mailData)
    });

    if (response.ok) {
        return new Response(
            JSON.stringify({ success: true, message: "Email sent!" }),
            { status: 200 }
        );
    } else {
        return new Response(
            JSON.stringify({ success: false, error: "Error sending email." }),
            { status: 500 }
        );
    }
}

