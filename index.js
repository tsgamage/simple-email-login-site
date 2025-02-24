import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "578324",
  database: "users",
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  let email = req.body.username;
  let password = req.body.password;

  try {
    await db.query("INSERT INTO register (email, password) VALUES ($1, $2);", [
      email,
      password,
    ]);
  } catch (err) {
    console.log("Email Already Registered");
  }

  res.render("home.ejs");
});

app.post("/login", async (req, res) => {
  let email = req.body.username;
  let password = req.body.password;
  let loginResult;

  try {
    loginResult = await db.query("SELECT * FROM register WHERE email = $1", [
      email,
    ]);
  } catch (err) {
    console.log("Error while executing the query");
  }
  if (loginResult.rowCount === 0) {
    console.log("This email is not registered. Please register first!");
    res.render("home.ejs");
  } else if (loginResult.rowCount === 1) {
    if (password === loginResult.rows[0].password) {
      res.render("secrets.ejs");
    } else {
      console.log("Wrong Email or Password");
      res.render("login.ejs");
    }
  } else {
    console.log("Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
