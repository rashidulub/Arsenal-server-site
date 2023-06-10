const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());
app.get('/',(req,res)=>{
    res.send('summer camp in runnig')
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bpxo3nu.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const menuCollection = client.db('summerDb').collection('menu')
    const classesCollection = client.db('summerDb').collection('classes')
    const userCollection = client.db('summerDb').collection('user')

    app.get('/menu',async(req,res)=>{
        const result = await menuCollection.find().toArray();
        res.send(result)
    })

    // user related api 

    app.get('/user',async(req,res)=>{
      const result = await userCollection.find().toArray();
      res.send(result)
    })




    app.post('/user',async(req,res)=>{
      const user = req.body;
      const query ={email: user.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
        return res.send ({message: 'user already existing'})
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    // made admin 

    app.patch('/user/admin/:id', async(req,res)=>{
      const id  = req.params.id;
      const filter = {_id: new ObjectId (id)}
      const updateDoc = {
        $set: {
          role : 'admin'
        }
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    // made instructor

    app.patch('/user/instructor/:id', async(req,res)=>{
      const id  = req.params.id;
      const filter = {_id: new ObjectId (id)}
      const updateDoc = {
        $set: {
          role : 'instructor'
        }
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    

    app.post('/classes', async(req,res)=>{
        const item = req.body;
        console.log(item);
        const result = await classesCollection.insertOne(item)
        res.send(result)

    })

    // app.get('/classes',async(req,res)=>{
    //   const email =req.query.email;
    //   console.log(email);
    //   if(!email){
    //     res.send([])
    //   }
    //   const query = {email: email}; 
    //   const result = await classesCollection.find(query).toArray();
    //   res.send(result);
    // })

    app.get('/classes', async(req,res)=>{
      console.log(req.query.email);
      let query = {}
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await classesCollection.find(query).toArray();
      res.send(result)
    })


    // delete classes 

    app.delete('/classes/:id', async(req,res)=>{
      const id= req.params.id;
      const query = { _id: new Object(id)};
      const result = await classesCollection.deleteOne(query);
      res.send(result)
    })

    // create payment intent

    app.post('/create-payment-intent', async(req,res)=>{
      const {price}= req.body;
      const amount = price*100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount : amount,
        currency : 'usd',
        payment_method_types: ['card'] 
      });
      res.send({
        clientSecret : paymentIntent.client_secret
      })

    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port,()=>{
    console.log(`summer camp in running on port ${port}`);
})