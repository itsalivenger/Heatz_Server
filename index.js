const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { connectToDb } = require('./modules/connection');  // Import the DB connection module

// Middleware setup
app.use(cors());
app.use(express.json());

// Import routes
const signupRoute = require('./Routes/signupRoute');  
const loginRoute = require('./Routes/loginRoute');
const resetPassRoute = require('./Routes/resetPassRoute.js');
const contactRoute = require('./Routes/contactRoute');
const newsletterRoute = require('./Routes/newsletterRoute');
const productsRoute = require('./Routes/productsRoute.js');
const checkoutRoute = require('./Routes/checkoutRoute');
const cartRoute = require('./Routes/cartRoute');
const shopRoute = require('./Routes/shopRoute');
const favoriteRoute = require('./Routes/favoriteRoute');
const ordersRoute = require('./Routes/ordersRoute');


// Connect to the database and start the server
(async () => {
  try {
    const client = await connectToDb();  // Establish connection
    app.locals.db = client.db('Heatz');  // Store DB in app.locals for access in routes

    // Route setup (pass DB if needed)
    app.use('/signup', signupRoute);
    app.use('/login', loginRoute);
    app.use('/resetPass', resetPassRoute);
    app.use('/contact', contactRoute);
    app.use('/newsletter', newsletterRoute);
    app.use('/products', productsRoute);
    app.use('/checkout', checkoutRoute);
    app.use('/cart', cartRoute);
    app.use('/shop', shopRoute);
    app.use('/favorite', favoriteRoute);
    app.use('/orders', ordersRoute);


    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server due to DB connection:', err);
    process.exit(1);  // Exit if DB connection fails
  }
})();
