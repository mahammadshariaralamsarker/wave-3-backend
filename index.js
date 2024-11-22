const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;


// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',

  ],
  optionsSuccessStatus: 200
}));
app.use(express.json()); 

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.mh62rbj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const db = client.db('Ecommerce');
const usersCollection = db.collection('users');
const productCollection = db.collection('product');
async function run() {
  try {
    await client.connect();
    

    // POST - Add a new user
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser); // Insert the new user
      res.send(result);
    });

    // GET - Get user by email
    app.get('/users/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const user = await usersCollection.findOne({ email: email });
        if (user) {
          res.send(user);
        } else {
          res.status(404).send({ message: 'User not found' });
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });

    // GET - Get all users
    app.get('/users', async (req, res) => {
      try {
        const users = await usersCollection.find({}).toArray();
        res.status(200).send(users); // Send the list of users
      } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });

    // DELETE - Delete user by email
    app.delete('/users/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const deletedUser = await usersCollection.findOneAndDelete({ email: email });

        if (!deletedUser.value) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
      } catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).json({ error: 'Failed to delete user' });
      }
    });

    // PUT - Update user role by email
    app.put('/users/:email', async (req, res) => {
      try {
        const { role } = req.body;
        if (!role || !['admin', 'buyer', 'seller'].includes(role)) {
          return res.status(400).json({ error: 'Invalid role' });
        }
        console.log(role);
        const email = req.params.email;
        const updatedUser = await usersCollection.Update(
          { email: email },
          { $set: { role: role } },
          { returnDocument: 'after' }
        );

        if (!updatedUser.value) {
          return res.status(404).json({ error: 'User not found' });
        }
        console.log('Updated User:', updatedUser);

        res.send(updatedUser.value);
      } catch (err) {
        console.error('Error updating user role:', err.message);
        res.status(500).json({ error: 'Failed to update user role' });
      }
    });
    // products
    app.post('/product', async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product); // Insert the new user
      res.send(result);
    });
    app.get('/products/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const products = await productCollection.find({ email }).toArray();
        if (products.length > 0) {
          res.send(products);
        } else {
          res.status(404).json({ message: 'No products found for this email' });
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
    app.delete('/products/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await productCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount > 0) {
          res.status(200).send({ message: 'Product deleted successfully' });
        } else {
          res.status(404).send({ message: 'Product not found' });
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });
    // get all product
    app.get('/products', async (req, res) => {
      try {
        const products = await productCollection.find({}).toArray(); // Fetch all products
        if (products.length > 0) {
          res.send(products);
        } else {
          res.status(404).json({ message: 'No products found' });
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });


  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run();
app.get('/', (req, res) => {
  res.send('Coffee maker server is running');
});
// Start the server
app.listen(port, () => {
  console.log(`Ecommerce app running on port ${port}`);
});
