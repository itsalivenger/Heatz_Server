const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
    const { name, email, subject, phone, message } = req.body;
    console.log(req.body);
    // Validate required fields
    if (!name || !email || !subject || !phone || !message) {
        return res.status(400).json({ error: 'Tout les champs sont requis.' });
    }

    try {
        // Create a transporter object
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password'
            }
        });

        // Send the email
        await transporter.sendMail({
            from: 'your-email@gmail.com',
            to: email,
            subject: subject,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
        });

        res.status(200).json({ message: 'Email sent successfully.' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email.' });
    }
});

module.exports = router;