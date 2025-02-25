const express = require('express');
const router = express.Router();
const upload = require('../modules/multerConfig');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../modules/cloudinaryHelper');

// ajouter un produit de puis l'admin panel

router.post('/addProduct', upload.array('productImages', 10), async (req, res) => {
    const { productName, price, category, description, SKU, featuresStr } = req.body;
    const features = featuresStr.split('$dedrno');
    try {
        const imageUrls = [];

        // Upload images to Cloudinary
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadToCloudinary(file.buffer); // Upload each file using the helper function
                imageUrls.push(url);
            }
        }

        const db = req.app.locals.db;
        const productsCollection = db.collection('Products');

        // Optional: Check if a product with the same productName already exists
        const existingProduct = await productsCollection.findOne({ productName });
        if (existingProduct) {
            return res.status(400).json({ error: 'Produit avec ce nom deja existe.' });
        }
        console.log(typeof features);
        // Create the new product object
        const newProduct = {
            productName,
            price: parseFloat(price),
            category,
            description,
            SKU,
            isActive: true,
            features,
            imageUrls, // Save all image URLs
            createdAt: new Date(),
        };

        const result = await productsCollection.insertOne(newProduct);
        return res.status(200).json({ message: 'Product added successfully!', productId: result.insertedId });
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});



// chercher des produits selon leur nom
router.post('/getProducts/:name', async (req, res) => {
    const searchVal = req.params.name;
    const searchBy = req.body.searchBy;

    try {
        const db = req.app.locals.db; // Access the database from app.locals
        const productsCollection = db.collection('Products');


        // Check if the name parameter is 'all'
        if (searchVal.toLowerCase() === 'all') {
            query = {}; // Fetch all products
        } else {
            // Search for products by name (case-insensitive, partial matches allowed)
            query = { [searchBy]: { $regex: new RegExp(searchVal, 'i') } };
        }

        const products = await productsCollection.find(query).toArray(); // Convert cursor to array

        if (products.length === 0) {
            return res.status(403).json({ error: 'No products found.' });
        }

        return res.status(200).json(products); // Return the array of products
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


router.post('/searchItem', async (req, res) => {
    const searchVal = req.body.searchVal.trim(); // Trim any extra spaces
    try {
        const db = req.app.locals.db; // Access the database from app.locals
        const productsCollection = db.collection('Products');

        // Perform regex-based partial match for productName, SKU, and category
        const products = await productsCollection.find({
            $or: [
                { productName: { $regex: searchVal, $options: "i" } }, // Case-insensitive regex
                { SKU: { $regex: searchVal, $options: "i" } },
                { category: { $regex: searchVal, $options: "i" } }
            ]
        }).toArray();

        if (products.length === 0) {
            return res.status(403).json({ error: 'No products found.' });
        }

        return res.status(200).json(products); // Return the array of products
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// chercher des produits pour le tableau avec get
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

router.get('/getProduct/:id', async (req, res) => {
    const productId = req.params.id;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID.' });
    }

    try {
        const db = req.app.locals.db;
        const productsCollection = db.collection('Products');

        // Find the product using ObjectId
        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


router.get('/carouselSamples', async (req, res) => {
    try {
        const db = req.app.locals.db; // Access the database from app.locals
        const productsCollection = db.collection('Products');

        // Fetch random products
        const products = await productsCollection.aggregate([
            { $match: { isActive: true } },
            { $sample: { size: 10 } },
        ]).toArray();

        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found.' });
        }
        return res.status(200).json({ products }); // Return the array of products
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
})


router.put('/updateProduct', async (req, res) => {
    const { updatedData } = req.body;
    const productId = req.body._id;


    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID.' });
    }

    // Remove _id from updatedData to prevent immutable field error
    const { _id, ...dataToUpdate } = updatedData;

    // Check if there's valid data to update
    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update.' });
    }

    try {
        const db = req.app.locals.db;
        const productsCollection = db.collection('Products');

        // Find and update the product by its _id
        const result = await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $set: dataToUpdate }
        );

        // Handle cases where the product was not found
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        // Handle cases where the product was not modified
        if (result.modifiedCount === 0) {
            return res.status(200).json({ message: 'No changes made to the product.' });
        }

        return res.status(200).json({ message: 'Product updated successfully.' });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.put('/toggleProductActiveState/:id', async (req, res) => {
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

        // Toggle the active state of the product using ObjectId
        const result = await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $set: { active: !product.active } }
        );

        if (result.modifiedCount === 0) {
            return res.status(200).json({ message: 'Etat du produit non modifié.' });
        }

        return res.status(200).json({ message: 'Etat du produit modifié avec succès!' });
    } catch (error) {
        console.error('Error toggling product active state:', error);
        return res.status(500).json({ error: 'Problème lors de la modification de l\'etat du produit.' });
    }
});


router.delete('/deleteProduct/:id', async (req, res) => {
    const productId = req.params.id;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID.' });
    }

    try {
        const db = req.app.locals.db;
        const productsCollection = db.collection('Products');

        // Find the product using ObjectId
        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        // Delete images from Cloudinary
        if (product.imageUrls?.length > 0) {
            await Promise.all(
                product.imageUrls.map(async (imageUrl) => {
                    try {
                        await deleteFromCloudinary(imageUrl, 'products');
                    } catch (cloudinaryError) {
                        console.error(`Error deleting image from Cloudinary (${imageUrl}):`, cloudinaryError);
                    }
                })
            );
        }

        // Delete the product from the database
        const result = await productsCollection.deleteOne({ _id: new ObjectId(productId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Failed to delete product.' });
        }

        return res.status(200).json({ message: 'Product and associated images deleted successfully!' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});



module.exports = router;
