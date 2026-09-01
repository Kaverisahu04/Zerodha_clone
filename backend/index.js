const dns = require("dns").promises;
dns.setServers(["1.1.1.1", ])

require("dotenv").config();
const bcrypt = require("bcrypt");

const express = require("express");
const mongoose = require("mongoose"); 
const jwt = require("jsonwebtoken"); 
const bodyParser = require("body-parser");
const cors = require("cors");

const { HoldingsModel } = require("./model/HoldingsModel");

const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { UserModel } = require("./model/UserModel");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const app = express();

app.use(cors());
app.use(bodyParser.json());

// app.get("/addHoldings", async (req, res) => {
//   let tempHoldings = [
//     {
//       name: "BHARTIARTL",
//       qty: 2,
//       avg: 538.05,
//       price: 541.15,
//       net: "+0.58%",
//       day: "+2.99%",
//     },
//     {
//       name: "HDFCBANK",
//       qty: 2,
//       avg: 1383.4,
//       price: 1522.35,
//       net: "+10.04%",
//       day: "+0.11%",
//     },
//     {
//       name: "HINDUNILVR",
//       qty: 1,
//       avg: 2335.85,
//       price: 2417.4,
//       net: "+3.49%",
//       day: "+0.21%",
//     },
//     {
//       name: "INFY",
//       qty: 1,
//       avg: 1350.5,
//       price: 1555.45,
//       net: "+15.18%",
//       day: "-1.60%",
//       isLoss: true,
//     },
//     {
//       name: "ITC",
//       qty: 5,
//       avg: 202.0,
//       price: 207.9,
//       net: "+2.92%",
//       day: "+0.80%",
//     },
//     {
//       name: "KPITTECH",
//       qty: 5,
//       avg: 250.3,
//       price: 266.45,
//       net: "+6.45%",
//       day: "+3.54%",
//     },
//     {
//       name: "M&M",
//       qty: 2,
//       avg: 809.9,
//       price: 779.8,
//       net: "-3.72%",
//       day: "-0.01%",
//       isLoss: true,
//     },
//     {
//       name: "RELIANCE",
//       qty: 1,
//       avg: 2193.7,
//       price: 2112.4,
//       net: "-3.71%",
//       day: "+1.44%",
//     },
//     {
//       name: "SBIN",
//       qty: 4,
//       avg: 324.35,
//       price: 430.2,
//       net: "+32.63%",
//       day: "-0.34%",
//       isLoss: true,
//     },
//     {
//       name: "SGBMAY29",
//       qty: 2,
//       avg: 4727.0,
//       price: 4719.0,
//       net: "-0.17%",
//       day: "+0.15%",
//     },
//     {
//       name: "TATAPOWER",
//       qty: 5,
//       avg: 104.2,
//       price: 124.15,
//       net: "+19.15%",
//       day: "-0.24%",
//       isLoss: true,
//     },
//     {
//       name: "TCS",
//       qty: 1,
//       avg: 3041.7,
//       price: 3194.8,
//       net: "+5.03%",
//       day: "-0.25%",
//       isLoss: true,
//     },
//     {
//       name: "WIPRO",
//       qty: 4,
//       avg: 489.3,
//       price: 577.75,
//       net: "+18.08%",
//       day: "+0.32%",
//     },
//   ];

//   tempHoldings.forEach((item) => {
//     let newHolding = new HoldingsModel({
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.day,
//       day: item.day,
//     });

//     newHolding.save();
//   });
//   res.send("Done!");
// });

// app.get("/addPositions", async (req, res) => {
//   let tempPositions = [
//     {
//       product: "CNC",
//       name: "EVEREADY",
//       qty: 2,
//       avg: 316.27,
//       price: 312.35,
//       net: "+0.58%",
//       day: "-1.24%",
//       isLoss: true,
//     },
//     {
//       product: "CNC",
//       name: "JUBLFOOD",
//       qty: 1,
//       avg: 3124.75,
//       price: 3082.65,
//       net: "+10.04%",
//       day: "-1.35%",
//       isLoss: true,
//     },
//   ];

//   tempPositions.forEach((item) => {
//     let newPosition = new PositionsModel({
//       product: item.product,
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.net,
//       day: item.day,
//       isLoss: item.isLoss,
//     });

//     newPosition.save();
//   });
//   res.send("Done!");
// });

app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.post("/newOrder", async (req, res) => {
  try {
    // 1. Save order
    let newOrder = new OrdersModel({
      name: req.body.name,
      qty: req.body.qty,
      price: req.body.price,
      mode: req.body.mode,
    });

    await newOrder.save();

    // 2. If BUY, create/update position
    if (req.body.mode === "BUY") {
      let existingPosition = await PositionsModel.findOne({
        name: req.body.name,
      });

      if (existingPosition) {
        // Existing position update

        let oldQty = existingPosition.qty;
        let oldAvg = existingPosition.avg;

        let newQty = Number(req.body.qty);
        let newPrice = Number(req.body.price);

        let totalQty = oldQty + newQty;

        let newAvg =
          (oldQty * oldAvg + newQty * newPrice) / totalQty;

        existingPosition.qty = totalQty;
        existingPosition.avg = newAvg;
        existingPosition.price = newPrice;

        await existingPosition.save();
      } else {
        // New position

        let newPosition = new PositionsModel({
          product: "CNC",
          name: req.body.name,
          qty: Number(req.body.qty),
          avg: Number(req.body.price),
          price: Number(req.body.price),
          net: "0.00",
          day: "0.00%",
          isLoss: false,
        });

        await newPosition.save();
      }
    }

    res.send("Order saved!");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

app.get("/allOrders", async (req, res) => {
  let allOrders = await OrdersModel.find({});
  res.json(allOrders);
});

app.post("/signup", async (req, res) => {
    try {
      console.log("SIGNUP REQUEST:", req.body);
        const { email, username, password } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
          console.log("USER ALREADY EXISTS");
            return res.json({
                success: false,
                message: "User already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(String(password), 10);

        // Create new user
        const newUser = new UserModel({
            email,
            username,
            password: hashedPassword,
        });

        await newUser.save();
        console.log("USER SAVED:", newUser);


        res.json({
            success: true,
            message: "Signup successful",
        });

    } catch (error) {
        console.log("SIGNUP ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
});

app.post("/login", async (req,res)=>{
    const {email,password} = req.body;

    try{
        const user = await UserModel.findOne({email: email});

        if(!user){
            return res.json({
                success:false,
                message:"User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({
                success:false,
                message:"Wrong password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                username: user.username,
                email: user.email
            }
        });
    }catch(error){
        res.json({
            success:false,
            message:error.message
        });
    }
});

app.get("/user", (req, res) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.json({
                success: false,
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.json({
            success: true,
            user: {
                username: decoded.username,
                email: decoded.email
            }
        });

    } catch (error) {
        res.json({
            success: false,
            message: "Invalid token"
        });
    }
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
  console.log("App started!");
  mongoose.connect(uri).then(()=>console.log("DB started!"))
  .catch((err)=>console.log(err))
  
});