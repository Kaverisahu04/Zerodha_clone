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
const { FundsModel } = require("./model/FundsModel");
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
    const { name, qty, price, mode } = req.body;

    const orderQty = Number(qty);
    const orderPrice = Number(price);

    // Total amount of this order
    const totalAmount = orderQty * orderPrice;


    // ================= BUY =================

    if (mode === "BUY") {

      // 1. Check Funds
      const funds = await FundsModel.findOne({});

      if (!funds) {
        return res.status(400).send("Funds account not found");
      }

      // 2. Check Available Cash
      if (totalAmount > funds.availableCash) {
        return res.status(400).send("Insufficient funds");
      }


      // 3. Save Order
      const newOrder = new OrdersModel({
        name,
        qty: orderQty,
        price: orderPrice,
        mode,
      });

      await newOrder.save();


      // 4. Update Position
      const existingPosition = await PositionsModel.findOne({ name });

      if (existingPosition) {

        const oldQty = existingPosition.qty;
        const oldAvg = existingPosition.avg;

        const totalQty = oldQty + orderQty;

        const newAvg =
          (oldQty * oldAvg + orderQty * orderPrice) / totalQty;

        existingPosition.qty = totalQty;
        existingPosition.avg = newAvg;
        existingPosition.price = orderPrice;

        await existingPosition.save();

      } else {

        const newPosition = new PositionsModel({
          product: "CNC",
          name,
          qty: orderQty,
          avg: orderPrice,
          price: orderPrice,
          net: "0.00",
          day: "0.00%",
          isLoss: false,
        });

        await newPosition.save();
      }


      // 5. Update Holdings
      const existingHolding = await HoldingsModel.findOne({ name });

      if (existingHolding) {

        const oldQty = existingHolding.qty;
        const oldAvg = existingHolding.avg;

        const totalQty = oldQty + orderQty;

        const newAvg =
          (oldQty * oldAvg + orderQty * orderPrice) / totalQty;

        existingHolding.qty = totalQty;
        existingHolding.avg = newAvg;
        existingHolding.price = orderPrice;

        await existingHolding.save();

      } else {

        const newHolding = new HoldingsModel({
          name,
          qty: orderQty,
          avg: orderPrice,
          price: orderPrice,
          net: "0.00%",
          day: "0.00%",
        });

        await newHolding.save();
      }


      // 6. Deduct Money from Funds
      funds.availableCash = funds.availableCash - totalAmount;

      funds.usedMargin = funds.usedMargin + totalAmount;

      await funds.save();


      return res.send("Buy order saved!");
    }



    // ================= SELL =================

    if (mode === "SELL") {

      // 1. Check Position
      const existingPosition = await PositionsModel.findOne({ name });

      if (!existingPosition) {
        return res.status(400).send("You don't have this stock");
      }


      // 2. Check Position Quantity
      if (orderQty > existingPosition.qty) {
        return res.status(400).send("Not enough quantity");
      }


      // 3. Check Holding
      const existingHolding = await HoldingsModel.findOne({ name });

      if (!existingHolding) {
        return res.status(400).send("Holding not found");
      }


      // 4. Check Holding Quantity
      if (orderQty > existingHolding.qty) {
        return res.status(400).send("Not enough holding quantity");
      }


      // 5. Save SELL Order
      const newOrder = new OrdersModel({
        name,
        qty: orderQty,
        price: orderPrice,
        mode,
      });

      await newOrder.save();


      // 6. Reduce Position Quantity
      existingPosition.qty =
        existingPosition.qty - orderQty;

      if (existingPosition.qty === 0) {

        await PositionsModel.deleteOne({
          _id: existingPosition._id,
        });

      } else {

        await existingPosition.save();
      }


      // 7. Reduce Holding Quantity
      const holdingCost =
        existingHolding.avg * orderQty;

      existingHolding.qty =
        existingHolding.qty - orderQty;

      if (existingHolding.qty === 0) {

        await HoldingsModel.deleteOne({
          _id: existingHolding._id,
        });

      } else {

        await existingHolding.save();
      }


      // 8. Add SELL Money to Funds
      const funds = await FundsModel.findOne({});

      if (!funds) {
        return res.status(400).send("Funds account not found");
      }

      // Money received from selling stock
      funds.availableCash =
        funds.availableCash + totalAmount;

      // Reduce used margin according to original holding cost
      funds.usedMargin =
        Math.max(0, funds.usedMargin - holdingCost);

      await funds.save();


      return res.send("Sell order saved!");
    }



    // ================= INVALID MODE =================

    return res.status(400).send("Invalid order mode");

  } catch (error) {

    console.log(error);

    res.status(500).send("Something went wrong");
  }
});

app.get("/allOrders", async (req, res) => {
  let allOrders = await OrdersModel.find({});
  res.json(allOrders);
});

app.get("/allFunds", async (req, res) => {
  try {
    let funds = await FundsModel.findOne({});

    // Agar funds ka record nahi hai to pehli baar create hoga
    if (!funds) {
      funds = new FundsModel({});
      await funds.save();
    }

    res.json(funds);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
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