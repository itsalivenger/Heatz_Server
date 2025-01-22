const { ObjectId } = require('mongodb'); // Import ObjectId
const router = require('express').Router();

router.get('/:user_id', async (req, res) => {
    const user_id = req.params.user_id;

    // Validate ObjectId format
    if (!ObjectId.isValid(user_id)) {
        return res.status(400).json({ error: 'ID utilisateur invalide.' });
    }

    try {
        const db = req.app.locals.db; // Access the database
        const usersCollection = db.collection('Users');

        // Find the user by their ID
        const user = await usersCollection.findOne({ _id: new ObjectId(user_id) });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        return res.status(200).json({ favorite: user.favorite });
    } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
        return res.status(500).json({ error: 'Problème lors de la récupération des favoris.' });
    }
});

router.put('/', async (req, res) => {
    const { favorite, user } = req.body;
    try {
        // Validate ObjectId
        if (!user || !ObjectId.isValid(user._id)) {
            return res.status(400).json({ error: 'Identifiant utilisateur invalide.' });
        }

        const db = req.app.locals.db; // Access the database    
        const usersCollection = db.collection('Users');

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(user._id) },
            { $set: { favorite } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        return res.status(200).json({ message: 'Favoris mis à jour.', favorite });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des favoris:', error);
        return res.status(500).json({ error: 'Problème lors de la mise à jour des favoris.' });
    }
});

router.post('/delete', async (req, res) => {
    const { user_id, product_Id } = req.body;
    console.log(user_id, product_Id);
    try {
        // Validate ObjectIds
        if (!ObjectId.isValid(user_id) || !ObjectId.isValid(product_Id)) {
            return res.status(400).json({ error: 'Vous devez vous connecter d\'abord.' });
        }

        // Access the database from the request object
        const db = req.app.locals.db;
        const usersCollection = db.collection('Users');

        // Find the user by their ID
        const user = await usersCollection.findOne({ _id: new ObjectId(user_id) });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        // Remove the product from the user's favorite list
        user.favorite = user.favorite.filter(product => product._id.toString() !== product_Id);

        // Update the user document in the database
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(user_id) },
            { $set: { favorite: user.favorite } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        return res.status(200).json({ message: 'Produit supprimé du favoris.', favorite: user.favorite });
    } catch (error) {
        console.error('Erreur lors de la suppression du produit du favoris:', error);
        return res.status(500).json({ error: 'Problème lors de la suppression du produit du favoris.' });
    }
})

router.post('/', async (req, res) => {
    const { product_Id, user_id } = req.body;

    try {
        // Validate ObjectIds
        if (!ObjectId.isValid(product_Id) || !ObjectId.isValid(user_id)) {
            return res.status(400).json({ error: 'Vous devez vous connecter d\'abord.' });
        }

        // Access the database from the request object
        const db = req.app.locals.db;
        const usersCollection = db.collection('Users');

        // Find the product by its ID
        const product = await db.collection('Products').findOne({ _id: new ObjectId(product_Id) });
        if (!product) {
            return res.status(404).json({ error: 'Produit introuvable.' });
        }

        // Find the user by their ID
        const user = await usersCollection.findOne({ _id: new ObjectId(user_id) });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        // Check if the product is already in the user's favorite list
        const isFavorite = user.favorite.some(fav => fav._id.toString() === product_Id);
        if (isFavorite) {
            return res.status(400).json({ error: 'Le produit est déjà dans les favoris.' });
        }

        // Add the product to the user's favorite list
        user.favorite.push(product);

        // Update the user document in the database
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(user_id) },
            { $set: { favorite: user.favorite } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        return res.status(200).json({ message: 'Produit ajouté aux favoris.', favorite: user.favorite });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des favoris:', error);
        return res.status(500).json({ error: 'Problème lors de la mise à jour des favoris.' });
    }
});


module.exports = router;
