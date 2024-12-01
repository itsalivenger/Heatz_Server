const express = require('express');
require('dotenv').config();
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');  // Import JWT library
const JWT_SECRET = process.env.JWT_SECRET; // Set secret key for signing JWT

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        const db = req.app.locals.db;  // Access the database from app.locals
        const usersCollection = db.collection('Users');

        // Find user by email
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        // Compare password with hashed password in database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
        }

        // User is authenticated, generate a JWT token
        const token = jwt.sign(
            { _id: user._id, role: user.role }, // Payload (you can add more details here if needed)
            JWT_SECRET, // Secret key
            { expiresIn: '1h' } // Token expiry time (e.g., 1 hour)
        );

        // Send the token and user role in response
        res.status(200).json({
            message: 'Connexion reussie!',
            token: token,
            role: user.role,
            user
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
