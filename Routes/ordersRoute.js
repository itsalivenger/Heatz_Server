const router = require('express').Router();
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    const db = req.app.locals.db;
    const ordersCollection = db.collection('Orders');

    try {
        // Extract query parameters
        const { lastOrderId, limit = 10, sortBy, sortOrder = 'des' } = req.query;

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

router.post('/search', async (req, res) => {
    const { searchTerm, searchBy } = req.body;
    console.log('Search Term:', searchTerm, 'Search By:', searchBy); // Debugging log

    const db = req.app.locals.db;
    const ordersCollection = db.collection('Orders');

    try {
        const limit = 10; // Number of orders to return

        // If searchTerm is an empty string, return all orders (with limit)
        if (searchTerm === '') {
            const orders = await ordersCollection.find().limit(limit).toArray();
            return res.status(200).json({ orders });
        }

        // Validate searchBy
        if (!searchBy) {
            return res.status(400).json({ error: 'Missing searchBy in request body.' });
        }

        let query = {};

        
        // Build the query based on searchBy
        if (searchBy === '_id') {
            // Use aggregation to convert _id to string and perform regex search
            const orders = await ordersCollection.aggregate([
                {
                    $addFields: {
                        idString: { $toString: "$_id" } // Convert _id to string
                    }
                },
                {
                    $match: {
                        idString: { $regex: new RegExp(searchTerm, 'i') } // Search by idString
                    }
                },
                {
                    $limit: limit // Limit the number of results
                }
            ]).toArray();

            return res.status(200).json({ orders });
        } else if (searchBy === 'email') {
            query = { 'userInfo.formData.email': { $regex: new RegExp(searchTerm, 'i') } };
            const orders = await ordersCollection.find(query).limit(limit).toArray();
            return res.status(200).json({ orders });
        } else {
            return res.status(400).json({ error: 'Invalid search field.' });
        }

    } catch (error) {
        console.error('Error searching orders:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/user/:user_id', async (req, res) => {
    const db = req.app.locals.db;
    const ordersCollection = db.collection('Orders');
    try {
        const user_id = req.params.user_id;

        const orders = await ordersCollection.find({ 'userInfo.user_id': user_id }).toArray();
        return res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching orders for user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/status/:id', async (req, res) => {
    const { newStatus } = req.body;

    const db = req.app.locals.db;
    const ordersCollection = db.collection('Orders');

    try {
        const result = await ordersCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status: newStatus } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        return res.status(200).json({ message: 'Order status updated successfully.' });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.delete('/:id', async (req, res) => {
    const db = req.app.locals.db;
    const ordersCollection = db.collection('Orders');

    try {
        const result = await ordersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        return res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (error) {
        console.error('Error deleting order:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
