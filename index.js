const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

// middleware configuration
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.fj40tmy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    const beautyMakeupCollection = await client
      .db("beautyDB")
      .collection("beauty");
    // Send a ping to confirm a successful connection
    /* 
Api Route Start
*/
    // get all data from database
    app.get("/allmakeuptoys", async (req, res) => {
      const result = await beautyMakeupCollection.find().toArray();
      res.send(result);
    });

    // find data by id
    app.get("/allmakeuptoys/:id", async (req, res) => {
      const result = await beautyMakeupCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // data insert in mongodb
    app.post("/allmakeuptoys", async (req, res) => {
      const result = await beautyMakeupCollection.insertOne(req.body);
      res.send(result);
    });
    /* 
    
    */
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    // Ensures that the client will close when you finish/error
    console.error(error);
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Beautybelle server is running......");
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
