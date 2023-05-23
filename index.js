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
    const indexKeys = { toyName: 1 };
    const indexOptions = { name: "NameTitle" };
    // const result = await beautyMakeupCollection.createIndex(
    //   indexKeys,
    //   indexOptions
    // );
    /* 
Api Route Start
*/
    // get all data from database
    app.get("/allmakeuptoys", async (req, res) => {
      const result = await beautyMakeupCollection.find().limit(20).toArray();
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

    // data fiund by email query
    app.get("/allmakeuptoysbyemail", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const beauty = beautyMakeupCollection.find(query);
      const result = await beauty.toArray();

      res.send(result);
    });

    // update data by put method
    app.put("/allmakeuptoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = req.body;
      const updatedMakeup = {
        $set: {
          sellerName: updateDoc.sellerName,
          email: updateDoc.email,
          photourl: updateDoc.photourl,
          toyName: updateDoc.toyName,
          subcategory: updateDoc.subcategory,
          price: updateDoc.price,
          quantity: updateDoc.quantity,
          ratings: updateDoc.ratings,
          description: updateDoc.description,
        },
      };
      const result = await beautyMakeupCollection.updateOne(
        query,
        updatedMakeup,
        options
      );

      res.send(result);
    });

    // delete data by id
    app.delete("/allmakeuptoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await beautyMakeupCollection.deleteOne(query);
      res.send(result);
    });

    // iput seach route
    app.get("/searchByName/:search", async (req, res) => {
      let searctText = req.params.search;
      const result = await beautyMakeupCollection
        .find({ toyName: { $regex: searctText, $options: "i" } })
        .toArray();
      res.send(result);
    });

    app.get("/toyscategory/:subcatgeory", async (req, res) => {
      const result = await beautyMakeupCollection
        .find({
          subcategory: req.params.subcatgeory,
        })
        .toArray();
      res.send(result);
    });

    app.get("/allmakeuptoysbyemailsort/:sortText", async (req, res) => {
      let email = req.query.email;
      if (req.params.sortText === "ascending") {
        const result = await beautyMakeupCollection
          .aggregate([
            {
              $match: {
                email: email, // Replace with your desired email
              },
            },
            { $addFields: { convertedPrice: { $toInt: "$price" } } },
            { $sort: { convertedPrice: 1 } },
            { $project: { convertedPrice: 0 } },
          ])
          .toArray();
        res.send(result);
      } else if (req.params.sortText === "descending") {
        const result = await beautyMakeupCollection
          .aggregate([
            {
              $match: {
                email: email, // Replace with your desired email
              },
            },
            { $addFields: { convertedPrice: { $toInt: "$price" } } },
            { $sort: { convertedPrice: -1 } },
            { $project: { convertedPrice: 0 } },
          ])
          .toArray();
        res.send(result);
      } else {
        const result = await beautyMakeupCollection
          .find({ email: email })
          .toArray();

        res.send(result);
      }
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
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Beautybelle server is running......");
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
