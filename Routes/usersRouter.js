const { ObjectId } = require('bson');

const router = require('express').Router();

router.get('/', async (req, res) => {
    try {
        const { db } = req.app.locals;
        const usersCollection = db.collection('Users');
        const users = await usersCollection.find().toArray();
        res.status(200).json({users});
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/search', async (req, res) => {
    try {
        const { db } = req.app.locals;
        const usersCollection = db.collection('Users');
        
        // Extract search term from query parameters (if any)
        const { searchTerm = '' } = req.query;  // Default to empty string if no searchTerm provided

        // Use regex to perform a case-insensitive search on name or email
        const regex = new RegExp(searchTerm, 'i');  // 'i' for case-insensitive matching
        
        // Query the database to find users whose name or email matches the search term
        const users = await usersCollection.find({
            $or: [
                { fullName: { $regex: regex } },
                { email: { $regex: regex } }
            ]
        }).toArray();
        
        res.status(200).json({users});
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const { db } = req.app.locals;
        const usersCollection = db.collection('Users');
        const { id } = req.params;

        // Attempt to delete the user by id
        const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




module.exports = router;