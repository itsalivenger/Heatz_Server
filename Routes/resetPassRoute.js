const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
    const { email, domain } = req.body;

    // Validate required fields
    if (!email) {
        return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    try {
        // Connect to MongoDB
        const db = req.app.locals.db;  // Access the database from app.locals
        const usersCollection = db.collection('Users');

        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour from now

        await usersCollection.updateOne({ email }, { $set: { resetToken, resetTokenExpiration } });

        // Send password reset email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password'
            }
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `Please click the following link to reset your password: ${domain}/reset-password?token=${resetToken}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending password reset email:', error);
                return res.status(500).json({ error: 'Error sending password reset email.' });
            } else {
                console.log('Password reset email sent:', info.response);
                return res.status(200).json({ message: 'Password reset email sent.' });
            }
        });
    } catch (error) {
        console.error('Error during password reset:', error);
        return res.status(500).json({ error: 'Error during password reset.' });
    }
});

module.exports = router;