const db = require("./database/dbConn.js");
const express = require("express");
const { ObjectId } = require("mongodb");
const port = 8080;
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
// app.use(cors());
app.use(express.json());
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const Passage = require("@passageidentity/passage-node");

const middleware = require("./api/middleware.js");

// module.exports = { getAvailableRooms, makeBooking };
const { getAvailableRooms, makeBooking } = require("./api/check.js");


// configure headers for the app

const passage = new Passage({
  appID: process.env.PASSAGE_APP_ID,
  apiKey: process.env.PASSAGE_API_KEY,
  authStrategy: "HEADER",
});

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  accessControlAllowCredentials: true,
  accessControlAllowOrigin: true,
};

app.use(cors(corsOptions));

// root sends welcome message
app.get("/", async (req, res) => {
  const collection = db.collection("ICICS");
  const result = await collection.find().toArray();
  console.log(result);
  res.send("Welcome to the Back-end API!");
});

app.post("/login", async (req, res) => {
  try {
    const userID = await passage.authenticateRequest(req);
    if (userID) {
      // user is authenticated
      const { email, phone } = await passage.user.get(userID);
      const identifier = email ? email : phone;
      console.log(identifier);
      const jwtToken = jwt.sign({ identifier: identifier }, "helloworld");
      return res
        .status(200)
        .cookie("token", jwtToken, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 3600000,
        })
        .cookie("psg_auth_token", "", { expires: new Date(0) })
        .send({ authStatus: "success", identifier: identifier });
    } else {
      return res.status(200).send({ authStatus: "failed", identifier: "none" });
    }
  } catch (e) {
    console.log(e);
    return res.status(200).send({ authStatus: "failed", identifier: "none" });
  }
});

app.post("/register", async (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;
  const address = req.body.address;
  const zipcode = req.body.zipcode;
  const city = req.body.city;
  const country = req.body.country;

  const collection = db.collection("users");
  const result = await collection.findOne({ username: username });

  if (result) {
    res.cookie("username", username);
    return res
      .status(400)
      .send({ msg: "username already taken", isAuth: false });
  } else {
    const result2 = await collection.insertOne({
      username: username,
      password: password,
      address: address,
      zipcode: zipcode,
      city: city,
      country: country,
    });
    return res
      .status(200)
      .send({ msg: "user created", result: result2, isAuth: false });
  }
});

app.get("/logout", middleware, (req, res) => {
    console.log("logout route hit");
    return res.status(200).cookie("token", "", { expires: new Date(0) }).send({ authStatus: "failed", identifier: req.user.identifier });
});

app.get("/verify", middleware, (req, res) => {
  console.log("verify route hit");
  res.status(200).send({ authStatus: "success", identifier: req.user.identifier });
});

app.get("/getCode", middleware, async (req, res) => {
  res.status(200).send({ msg: "token verified", isAuth: true });
});


app.get("/getRooms", async (req, res) => {
    const startTimeHour = parseInt(req.body.startTime);
    const startTime = new Date();
    startTime.setHours(startTimeHour, 0, 0, 0);
    const { red, yellow, green } = await getAvailableRooms(startTime);
    res.send({ red, yellow, green });
});


app.post("/makeBooking", async (req, res) => {
    const roomName = req.body.roomName;
    const startTime = new Date(req.body.startTime);
    const { success, message } = await makeBooking(roomName, startTime);
    res.send({ success, message });
}
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
