const sendEmail = require('../modules/sendEmail');

const router = require('express').Router();

router.post('/', async (req, res) => {
    const { formData, cart } = req.body;

    try {
        // Access the database from the request object
        const db = req.app.locals.db;
        const ordersCollection = db.collection('Orders');

        // Create the order object
        const newOrder = {
            userInfo: formData,
            cart: cart,
            createdAt: new Date(), // Set to current date and time
            status: 'pending',
        };        

        // Insert the order into the database
        await ordersCollection.insertOne(newOrder);
        sendEmail({
            to: formData.email,
            subject: 'Commande Heatz',
            text: `Merci pour votre commande!`,
        })
        sendEmail({
            to: process.env.Heatz_Email,
            subject: 'Commande Heatz',
            text: `Une nouvelle commande viens d'etre prise!`,
        })

        res.status(201).json({ message: 'Commande créée avec succès!' });
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

module.exports = router;
