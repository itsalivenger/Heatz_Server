const router = require('express').Router();

router.get('/', async (req, res) => {
    const db = req.app.locals.db;
    const ordersCollection = db.collection('Orders');

    try {
        // Extract query parameters
        const { lastOrderId, limit = 10, sortBy, sortOrder = 'asc' } = req.query;

        // Build the query object for pagination
        const query = {};

        if (lastOrderId) {
            query._id = { $gt: lastOrderId }; // Fetch orders after the last loaded order
        }

        // Sorting direction (1 for ascending, -1 for descending)
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Define sorting field based on sortBy parameter
        let sortField = {};

        if (sortBy === 'date') {
            sortField = { date: sortDirection };
        } else if (sortBy === 'amount') {
            sortField = { amount: sortDirection };
        } else if (sortBy === 'status') {
            sortField = { status: sortDirection };
        } else if (sortBy === 'clientName') {
            sortField = { clientName: sortDirection };
        }

        // Fetch sorted orders with pagination
        const orders = await ordersCollection.find(query)
                                             .sort(sortField)
                                             .limit(parseInt(limit)) // Limit the number of results
                                             .toArray();

        return res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
