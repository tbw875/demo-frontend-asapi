// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { Client } = require("pg");

const app = express();

// Setting up DB connection

const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: process.env.DB_PASSWORD,
  database: "screen-db",
});

client.connect();

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing

// ROUTE: post request
app.post("/api/entities", async (req, res) => {
  const { address } = req.body;
  const apiEndpoint = "https://api.chainalysis.com/api/risk/v2/entities";
  try {
    const response = await axios.post(
      apiEndpoint,
      { address },
      {
        headers: {
          "Content-Type": "application/json",
          Token: process.env.SERVER_API_KEY,
        },
      }
    );

    // Send response back to frontend
    res.json(response.data);
  } catch (error) {
    console.error("Error calling external API", error);
    res.status(500).send("Internal Server Error", error); // Sending error response to client
  }
});

// ROUTE: get request
app.get("/api/entities/:address", async (req, res) => {
  const { address } = req.params; // Captured from the URL
  const apiEndpoint = `https://api.chainalysis.com/api/risk/v2/entities/${address}`;

  console.log(`Server GET request for address: ${address}`); // Logging address for debugging

  try {
    const response = await axios.get(apiEndpoint, {
      headers: {
        "Content-Type": "application/json",
        Token: process.env.SERVER_API_KEY,
      },
    });

    // Send response back to frontend
    res.json(response.data);
  } catch (error) {
    console.error("Error calling external API", error);
    res.status(500).send("Internal Server Error"); // Sending error response to client
  }
});

// ROUTE: sql insert
app.post("/api/insert", async (req, res) => {
  try {
    const { address, risk } = req.body;
    const data = req.body; // this is the entire JSON object

    // Insert data to db
    const query = `
        INSERT INTO responses (address, risk, data)
        VALUES ($1, $2, $3);`;

    await client.query(query, [address, risk, data]);
    console.log("Data successfully inserted to db");
    res.status(200).json({ message: "Data stored in database" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ROUTE: fetch latest 5 records for visualization
app.get("/api/fetchLatest", async (req, res) => {
  try {
    const query = `
        SELECT * FROM responses
        ORDER BY id DESC
        LIMIT 5;`;

    const { rows } = await client.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "DB Fetch error" });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
