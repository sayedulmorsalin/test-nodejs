const { Client } = require("pg");
const express = require("express");

const app = express();
app.use(express.json());

const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "Polash@01775",
  database: "test",
  port: 5000,
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Connection error", err.stack));


app.post("/insert", (req, res) => {
  const { name, id } = req.body;
  const query = "INSERT INTO testTable (name, id) VALUES ($1, $2)";

  client.query(query, [name, id], (err, result) => {
    if (err) {
      console.error("Error executing query", err.stack);
      res.status(500).send("Error inserting data");
    } else {
      res.send("Data inserted successfully");
    }
  });
});

app.get("/getData", (req, res) => {
  const query = "SELECT * FROM testTable";

  client.query(query, (err, result) => {
    if (err) {
      console.error("Error executing query", err.stack);
      res.status(500).send("Error fetching data");
    } else {
      res.json(result.rows);
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

client.query("SELECT * FROM testTable", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    console.log("Query results:", res.rows);
  }
});
