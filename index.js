const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { connectToDb } = require('./modules/connection');  // Import the DB connection module
const origins = ['http://localhost:3000', 'https://heatzheatz.vercel.app', 'https://heatz.ma'];
const path = require('path');


// Middleware setup
app.use(cors( { origin: origins } ));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'products')));

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
const DashboardRoute = require('./Routes/adminDashboard.js');
const couponsRoute = require('./Routes/handleCouponsRoute.js');
const usersRoute = require('./Routes/usersRouter');
const testRoute = require('./Routes/testRoute');



// Connect to the database and start the server
(async () => {
  try {
    const client = await connectToDb();  // Establish connection
    app.locals.db = client.db('Heatz');  // Store DB in app.locals for access in routes
    app.get('/', (req, res) => {
      console.log('hello world dedrno');
      res.send('Hello World dedrno');
    })

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
    app.use('/adminDashboard', DashboardRoute);
    app.use('/coupons', couponsRoute);
    app.use('/users', usersRoute);
    app.use('/test', testRoute);

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server due to DB connection:', err);
    process.exit(1);  // Exit if DB connection fails
  }
})();
