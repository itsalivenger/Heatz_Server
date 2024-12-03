const express = require('express');
const router = express.Router();
const upload = require('../modules/multerConfig');
const { ObjectId } = require('mongodb');

router.post('/addProduct', upload.single('productImage'), async (req, res) => {
    const { productName, price, category, description } = req.body;
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/${req.file.filename}` : null;

    
    try {
        const db = req.app.locals.db;
        const productsCollection = db.collection('Products');

        // Optional: Check if a product with the same productName already exists
        const existingProduct = await productsCollection.findOne({ productName });
        if (existingProduct) {
            return res.status(400).json({ error: 'Product with this name already exists.' });
        }

        // Create the new product object
        const newProduct = {
            productName,
            price: parseFloat(price),
            category,
            description,
            imageUrl,
            createdAt: new Date(),
        };

        const result = await productsCollection.insertOne(newProduct);
        return res.status(200).json({ message: 'Product added successfully!', productId: result.insertedId });
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


router.get('/getProducts/:name', async (req, res) => {
    const productName = req.params.name;

    try {
        const db = req.app.locals.db; // Access the database from app.locals
        const productsCollection = db.collection('Products');


        // Search for products by name (case-insensitive, partial matches allowed)
        const products = await productsCollection.find({
            productName: { $regex: new RegExp(productName, 'i') }
        }).toArray(); // Convert cursor to array

        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found.' });
        }

        return res.status(200).json(products); // Return the array of products
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/adminTable', async (req, res) => {
    try {
        const db = req.app.locals.db; // Access the database from app.locals
        const productsCollection = db.collection('Products');

        // Fetch all products
        const products = await productsCollection.find().toArray();

        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found.' });
        }

        return res.status(200).json(products); // Return the array of products
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


router.put('/updateProduct', async (req, res) => {
    const updatedData = req.body;
    const productId = req.body._id;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID.' });
    }

    try {
        const db = req.app.locals.db;
        const productsCollection = db.collection('Products');

        // Remove _id from updatedData to prevent immutable field error
        const { _id, ...dataToUpdate } = updatedData;

        // Find and update the product by its _id
        const result = await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $set: dataToUpdate }  // Use the filtered data without _id
        );

        console.log(result);
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        return res.status(200).json({ message: 'Product updated successfully.' });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.delete('/deleteProduct/:id', async (req, res) => {
    const productId = req.params.id;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'ID du produit invalide.' });
    }

    try {
        const db = req.app.locals.db;
        const productsCollection = db.collection('Products');

        // Check if the product exists using ObjectId
        const product = await productsCollection.findOne({
            _id: new ObjectId(productId)
        });

        if (!product) {
            return res.status(404).json({ error: 'Produit introuvable.' });
        }

        // Delete the product using ObjectId
        const result = await productsCollection.deleteOne({
            _id: new ObjectId(productId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Échec de la suppression du produit.' });
        }

        return res.status(200).json({ message: 'Produit supprimé avec succès!' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});


module.exports = router;
