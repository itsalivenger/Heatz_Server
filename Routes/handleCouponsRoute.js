const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// GET all coupons
router.get('/', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const coupCollection = db.collection('Coupons');

        const coupons = await coupCollection.find().toArray();
        res.status(200).json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST a new coupon
router.post('/', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const coupCollection = db.collection('Coupons');

        const coupon = req.body;

        const result = await coupCollection.insertOne(coupon);
        res.status(201).json({ ...coupon, _id: result.insertedId });
    } catch (error) {
        console.error('Error adding coupon:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT (Update an existing coupon)
router.put('/:id', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const coupCollection = db.collection('Coupons');
        const { id } = req.params;
        const { _id, ...updatedCoupon } = req.body; // Exclude _id from updates

        const result = await coupCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedCoupon }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Coupon not found.' });
        }

        res.status(200).json({ message: 'Coupon updated successfully.' });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


// DELETE a coupon
router.delete('/:id', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const coupCollection = db.collection('Coupons');
        const { id } = req.params;

        const result = await coupCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Coupon not found.' });
        }

        res.status(200).json({ message: 'Coupon deleted successfully.' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


router.post('/apply_Promo', async (req, res) => {
    try {
        const { promoCode, cartTotal } = req.body;
        if (!promoCode) {
            return res.status(400).json({ error: 'Promo code is required.' });
        }

        const db = req.app.locals.db;
        const couponsCollection = db.collection('Coupons');

        // Check if the promo code exists and is active
        const coupon = await couponsCollection.findOne({
            code: promoCode,
            isActive: true
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Invalid or expired promo code.' });
        }

        // Check expiration date
        const currentDate = new Date();
        const expirationDate = new Date(coupon.expirationDate);
        if (currentDate > expirationDate) {
            return res.status(400).json({ error: 'Promo code has expired.' });
        }

        // Check if the cart total meets the minimum amount requirement
        if (cartTotal < coupon.minimumAmount) {
            return res.status(400).json({
                error: `Cart total must be at least ${coupon.minimumAmount} to use this promo code.`
            });
        }

        let discountAmount = 0;

        // Calculate the discount based on discount type
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
        } else if (coupon.discountType === 'fixed') {
            discountAmount = Math.min(cartTotal, coupon.discountValue);
        }

        // Apply the discount to the cart
        const newTotal = cartTotal - discountAmount;

        res.status(200).json({
            discount: discountAmount,
            newTotal: newTotal,
        });

    } catch (error) {
        console.error('Error applying promo code:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
