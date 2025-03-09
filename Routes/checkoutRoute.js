const sendEmail = require('../modules/sendEmail');
const router = require('express').Router();

router.post('/', async (req, res) => {
    const { formData, cart, user } = req.body;

    try {
        const db = req.app.locals.db;
        const ordersCollection = db.collection('Orders');
        const couponsCollection = db.collection('Coupons');

        // Check if a promo code exists
        if (formData.promoCode) {
            const coupon = await couponsCollection.findOne({ code: formData.promoCode });

            if (!coupon) {
                return res.status(400).json({ error: 'Code promo invalide.' });
            }

            // Optionally, check if the coupon is still valid (e.g., expiration date)
            if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
                return res.status(400).json({ error: 'Le code promo a expiré.' });
            }
        }

        // Create the order object
        const newOrder = {
            userInfo: { formData, user_id: user._id },
            cart: cart,
            createdAt: new Date(),
            status: 'pending',
        };

        // Insert the order into the database
        await ordersCollection.insertOne(newOrder);

        // Send confirmation emails
        sendEmail({
            to: formData.email,
            subject: 'Commande Heatz',
            text: `Merci pour votre commande!`,
        });
        sendEmail({
            to: process.env.Heatz_Email,
            subject: 'Commande Heatz',
            text: `Une nouvelle commande vient d'être prise!`,
        });

        res.status(201).json({ message: 'Commande créée avec succès!' });
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

module.exports = router;
