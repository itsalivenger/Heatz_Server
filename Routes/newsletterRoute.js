const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
    const { email } = req.body;


    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Format invalide de l\'email' });
    }

    try {
        const db = req.app.locals.db;  // Access the database from app.locals
        const subscribersCollection = db.collection('Subscribers');

        // Check if email already exists
        const existingSubscriber = await subscribersCollection.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ error: 'l\'email existe déja.' });
        }

        // Save the subscriber to the database
        // await subscribersCollection.insertOne({ name, email, subscribedAt: new Date() });
        console.log('added subscriber');
        // Send confirmation email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"Newsletter" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Inscription à notre newsletter confirme',
            text: `Bonjour ,\n\nMerci pour votre inscription à notre newsletter. Nous vous remercions de votre confiance et de votre soutien.\n\nCordialement,\nL\'équipe de Heatz`
        });

        return res.status(200).json({ message: 'Subscription successful!' });
    } catch (error) {
        console.error('Error during subscription:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/admin', async (req, res) => {
    const { subject, emailContent } = req.body;
    console.log(subject, emailContent);

    const db = req.app.locals.db;
    const subscribersCollection = db.collection('Subscribers');

    try {
        // Fetch all subscribers
        const subscribers = await subscribersCollection.find().toArray();

        if (!subscribers.length) {
            return res.status(400).json({ error: 'No subscribers found.' });
        }

        // Create a single transporter instance
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Create an array of email promises
        const emailPromises = subscribers.map((subscriber) =>
            transporter.sendMail({
                from: `"Newsletter" <${process.env.EMAIL_USER}>`,
                to: subscriber.email,
                subject: subject,
                text: emailContent,
            })
        );

        // Wait for all emails to be sent
        await Promise.all(emailPromises);

        return res.status(200).json({ message: 'Emails envoyés avec success!' });
    } catch (error) {
        console.error('Error sending emails:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/', async (req, res) => {
    const db = req.app.locals.db;
    const subscribersCollection = db.collection('Subscribers');

    try {
        // fetch 10 subscribers
        const subscribers = await subscribersCollection.find().limit(10).toArray();
        return res.status(200).json({ subscribers });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
