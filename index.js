const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dxtpm.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized Access" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "UnAuthorized Access" });
    }

    req.decoded = decoded;
    next();
  });

  // next();
}

// API

async function run() {
  try {
    await client.connect();

    const todoCollection = client.db("todo").collection("list");

    app.get("/list", async (req, res) => {
      const cursor = await todoCollection.find().toArray();
      res.send(cursor);
    });

    app.post("/list", async (req, res) => {
      const todo = req.body;
      const result = await todoCollection.insertOne(todo);
      res.send(result);
    });

    app.delete("/list/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteTodo = await todoCollection.deleteOne(query);

      res.send(deleteTodo);
    });

    app.put("/list/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: { status: true },
      };

      const result = await todoCollection.updateOne(filter, updateDoc);

      res.send({ result });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Todo List App");
});

app.listen(port, () => {
  console.log(`Todo List App listening on port ${port}`);
});
