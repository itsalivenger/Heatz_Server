const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');  // Import jwt to create token

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET; // Use environment variable for secret key

router.post('/', async (req, res) => {
  const { fullName, email, phoneNumber, password, termsAccepted } = req.body;

  // Validate required fields
  if (!fullName || !email || !password || !termsAccepted) {
    return res.status(400).json({ error: 'Tous les champs sont requis et vous devez accepter les termes.' });
  }

  try {
    const db = req.app.locals.db;  // Access the database from app.locals
    const usersCollection = db.collection('Users');

    // Check if the email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email existant.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object with additional properties
    const newUser = {
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      termsAccepted,
      cart: [],  // Initialize an empty cart,
      favorite: [],  // Initialize an empty favorite
      isAdmin: false,  // Set default admin status to false
      role: 'user',  // Assign a role (can be 'user' or 'admin')
      createdAt: new Date()
    };

    // Insert the new user into the database
    const result = await usersCollection.insertOne(newUser);
    console.log(result, newUser);
    // Create a JWT token
    const token = jwt.sign(
      { email: newUser.email, id: result.insertedId, isAdmin: newUser.isAdmin },  // Include isAdmin in the token payload
      JWT_SECRET,  // Secret key for signing the token
      { expiresIn: '1h' }  // Set token expiration (e.g., 1 hour)
    );

    // Return the success message and JWT token
    res.status(201).json({
      message: 'Utilisateur créé avec succès!',
      token,  // Send the token back to the client
      user: {
        id: result.insertedId,
        fullName: newUser.fullName,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        role: newUser.role,
        cart: newUser.cart  // Return the initialized cart
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
