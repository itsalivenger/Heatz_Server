const router = require('express').Router();

// Define the number of products to load per request (e.g., 10 products per load)
const loadLimit = 20;

router.get('/', async (req, res) => {
    const db = req.app.locals.db;
    const productsCollection = db.collection('Products');

    // Extract the 'n' parameter from the query string and convert it to an integer
    const startIndex = parseInt(req.query.n) || 0;
    const category = req.query.category || 'earphones';

    try {
        // Fetch products starting from 'startIndex' with a limit
        const products = await productsCollection.find( { category: category } )
            .skip(startIndex)     // Skip to the specified index
            .limit(loadLimit)      // Fetch only 'loadLimit' number of products
            .toArray();

        return res.status(200).json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
