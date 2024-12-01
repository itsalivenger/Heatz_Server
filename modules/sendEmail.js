const nodemailer = require('nodemailer');
require('dotenv').config(); // For securely managing email credentials

// Function to send an email
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        // Create a transporter object
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can use other services like Outlook or SMTP settings
            auth: {
                user: process.env.EMAIL_USER, // Your email from environment variables
                pass: process.env.EMAIL_PASS, // Your email password or app-specific password
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender email address
            to,                           // Recipient email address (passed as parameter)
            subject,                      // Email subject (passed as parameter)
            text,                         // Plain text content (passed as parameter)
            html,                         // HTML content (passed as parameter)
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);

        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: 'Failed to send email.', error };
    }
};

module.exports = sendEmail;
