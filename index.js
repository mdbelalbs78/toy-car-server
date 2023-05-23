const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json())

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dtiuxwh.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const servicesCollection = client.db('toyCars').collection('services');
    
    const indexKeys = { name: 1 }; 
    const indexOptions = { name: "services" }; 
    const result = await servicesCollection.createIndex(indexKeys, indexOptions);
    console.log(result);

    app.get('/services', async(req,res) =>{
       const cursor = servicesCollection.find().limit(20);
       const result = await cursor.toArray();
       res.send(result)
    })

    app.get('/services/:id',async(req,res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await servicesCollection.findOne(query)
      res.send(result)
    })

    app.get("/search/:text", async (req, res) => {
      const text = req.params.text;
      const result = await servicesCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } },           
          ],
        })
        .toArray();
      res.send(result);
    });

    app.delete('/services/:id', async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await servicesCollection.deleteOne(query)
      res.send(result)
    })

    app.put('/services/:id', async(req,res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert:true}
      const updateData = req.body;
      const data = {
        $set:{
          price:updateData.price,
          quantity:updateData.quantity,
          description:updateData.description,          
        }
      }
      const result = await servicesCollection.updateOne(filter,data,options)
      res.send(result)
    })

    app.post("/services", async (req, res) => {
      const body = req.body;
      const result = await servicesCollection.insertOne(body);    
      res.send(result)
    });

    app.get("/servicess/:email", async (req, res) => {
      //   console.log(req.params.email);
      const result = await servicesCollection
        .find({
          email: req.params.email,
        })
        .sort({
          price: -1
        })
        .toArray();
      res.send(result);
    });


    app.get("/toyCategory/:category", async (req, res) => {
      //   console.log(req.params.email);
      const result = await servicesCollection
        .find({
          
            category: req.params.category,
        })
       
        .toArray();
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res) => {
    res.send('toy cars is running')
})

app.listen(port,(req,res) => {
    console.log(`Car Toy is running ${port}`);
})