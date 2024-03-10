const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWIRE
app.use(cors());
// app.use(cors({
//   origin:"http://127.0.0.1:5173"
// }));
// app.use(cors({
//   origin: 'https://http://localhost:5173',
//   methods: ['GET', 'POST','PUT','DELETE','OPTIONS'],
// }))
app.use(express.json());



const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_KEY}@cluster0.4vd9ngi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const database = client.db('productDB');
    const productCollection = database.collection('productCollection');
    const cartCollection = database.collection('cartCollection');

    app.post('/products',async(req,res)=>{
        const product = req.body;
        const result = await productCollection.insertOne(product);
        res.send(product);
    })
    app.post('/cart', async(req,res)=>{
      const product = req.body;
      const query = {_id: product._id}
      console.log(query)
      const existingProduct = await cartCollection.findOne(query); 
      console.log(existingProduct);
      if(existingProduct){
        if(existingProduct._id === product._id){
          res.send({error: 'product already added'});
        }
      }  
      else{
        const result = await cartCollection.insertOne(product);
        res.send(result);
      }
     
    })

    app.delete('/cart/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: id};
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/cart',async(req,res)=>{
      const cursor = cartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/products',async(req,res)=>{
        const cursor = productCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/products/:id', async(req,res)=>{
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)};
      const result = await productCollection.findOne(query);
      res.send(result);
    })

    app.put('/products/:id', async(req,res)=>{
      const id = req.params.id;
      const product = req.body;
      const filter = {_id: new ObjectId(id)};
      const option = {upsert: true};
      const updateProduct = {
        $set: {
          image: product.image,
          name: product.name,
          brand: product.brand,
          price: product.price,
          rating: product.rating,
          select: product.select
        }
      };
      const result = await productCollection.updateOne(filter, updateProduct, option);
      res.send(result);

    })

    app.get('/productsByBrand/:brand', async(req,res)=>{
      const brand = req.params.brand;
      const query = {brand: brand};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

 



    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('all ok');
})

app.listen(port,()=>{
    console.log(`server is running on ${port}`);
})