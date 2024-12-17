const router = require('express').Router()


router.get("/", async (req, res) => {
    const db = req.app.locals.db;
    const ordersCollection = db.collection('Orders');
    const usersCollection = db.collection('Users');

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const sevenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

    try {
        // Fetch orders placed today
        const orders = await ordersCollection.find({ date: { $gte: startOfDay } }).toArray();

        // Calculate total sales of today
        const salesOfToday = orders.reduce((total, order) =>
            total + order.cart.reduce((subTotal, item) => subTotal + (item.price * item.quantity), 0), 0);

        // Count number of orders placed today
        const numOfOrders = orders.length;

        // Calculate total products sold today
        const nombreDesProduitsVendus = orders.reduce((total, order) =>
            total + order.cart.reduce((subTotal, item) => subTotal + item.quantity, 0), 0);

        // Count users created in the last week
        const usersThisLastWeek = await usersCollection.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        // Send response with all metrics
        return res.status(200).json({
            salesOfToday,
            numOfOrders,
            usersThisLastWeek,
            nombreDesProduitsVendus
        });

    } catch (error) {
        console.error('Error fetching metrics:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


module.exports = router