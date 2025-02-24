import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const saltRounds = 10;

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

  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
      console.log("Error while hashing: ", err);
    }

    console.log(hash);

    try {
      await db.query(
        "INSERT INTO register (email, password) VALUES ($1, $2);",
        [email, hash]
      );
      res.render("home.ejs");
    } catch (err) {
      res.send("Email Already Registered");
    }
  });
});



app.post("/login", async (req, res) => {
  let email = req.body.username;
  let enteredPassword = req.body.password;
  let loginResult;
  let hashedPassword;

  try {
    loginResult = await db.query("SELECT * FROM register WHERE email = $1", [
      email,
    ]);
  } catch (err) {
    console.log("Error while executing the query");
  }
  if (loginResult.rowCount === 0) {
    res.send("This email is not registered. Please register first!");
  } else if (loginResult.rowCount === 1) {

    hashedPassword = loginResult.rows[0].password

    bcrypt.compare(enteredPassword, hashedPassword, (err,hashResult)=>{
      if(err){
        console.log("Error while comparing passwords")
      }
      if (hashResult) {
        res.render("secrets.ejs");
      } else {
        res.send("Wrong Email or Password");
      }
    })

  } else {
    console.log("Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
