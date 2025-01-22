const router = require('express').Router();
const { ObjectId } = require('mongodb');

router.get('/:user_id', async (req, res) => {
  const db = req.app.locals.db;
  const user_id = req.params.user_id;

  const usersCollection = db.collection('Users');
  const user = await usersCollection.findOne({ _id: new ObjectId(user_id) });
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }
  return res.status(200).json({ cart: user.cart });
});

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
    const productsCollection = db.collection('Products');

    // Find the product by its ID
    let product = await productsCollection.findOne({ _id: new ObjectId(product_Id) });
    product = { ...product, quantity: 1 };
    if (!product) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }

    // Find the user by their ID
    const user = await usersCollection.findOne({ _id: new ObjectId(user_id) });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    // Check if the product is already in the user's cart
    const productInCart = user.cart.some(item => new ObjectId(item._id).equals(product._id));
    console.log(productInCart, user.cart, product._id);
    if (productInCart) {
      return res.status(400).json({ error: 'Le produit est déjà dans le panier.' });
    }

    // Add the product to the user's cart using $push
    await usersCollection.updateOne(
      { _id: new ObjectId(user_id) },
      { $push: { cart: product } }
    );

    return res.status(200).json({ message: 'Produit ajouté au panier.' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit au panier:', error);
    return res.status(500).json({ error: 'Problème lors de l\'ajout du produit au panier.' });
  }
});

router.put('/', async (req, res) => {
  const { cart, user } = req.body;
  try {
    // Validate ObjectId
    if (!user || !ObjectId.isValid(user._id)) {
      return res.status(400).json({ error: 'Identifiant utilisateur invalide.' });
    }

    // Access the database from the request object
    const db = req.app.locals.db;
    const usersCollection = db.collection('Users');

    // Update the user's cart
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(user._id) },
      { $set: { cart } }
    );

    // Check if the update was successful
    // console.log(result);
    // if (result.modifiedCount === 0) {
    //   return res.status(404).json({ error: 'Utilisateur introuvable ou panier non modifié.' });
    // }

    return res.status(200).json({ message: 'Panier mis à jour.', cart });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du panier:', error);
    return res.status(500).json({ error: 'Problème lors de la mise à jour du panier.' });
  }
});


module.exports = router;