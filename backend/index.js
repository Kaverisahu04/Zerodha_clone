const dns = require("dns").promises;
dns.setServers(["1.1.1.1", ])

require("dotenv").config();

console.log(
  "Finnhub API Key:",
  process.env.FINNHUB_API_KEY ? "Loaded" : "Not Loaded"
);

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

// ================= ADD FUNDS =================

app.post("/addFunds", async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).send("Invalid amount");
    }

    let funds = await FundsModel.findOne({});

    if (!funds) {
      funds = new FundsModel({});
    }

    funds.availableCash += amount;
    funds.openingBalance += amount;

    await funds.save();

    res.send("Funds added successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});


// ================= WITHDRAW FUNDS =================

app.post("/withdrawFunds", async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).send("Invalid amount");
    }

    const funds = await FundsModel.findOne({});

    if (!funds) {
      return res.status(400).send("Funds account not found");
    }

    if (amount > funds.availableCash) {
      return res.status(400).send("Insufficient funds");
    }

    funds.availableCash -= amount;
    funds.openingBalance -= amount;

    await funds.save();

    res.send("Funds withdrawn successfully");
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




app.get("/marketQuotes", async (req, res) => {
  try {
    const symbols = [
      "INFY.NS",
      "ONGC.NS",
      "TCS.NS",
      "KPITTECH.NS",
      "QUICKHEAL.NS",
      "WIPRO.NS",
      "M&M.NS",
      "RELIANCE.NS",
      "HINDUNILVR.NS",
    ];

    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`
          );

          const data = await response.json();

          if (
            !data.chart ||
            !data.chart.result ||
            !data.chart.result[0]
          ) {
            return null;
          }

          const meta = data.chart.result[0].meta;

          const ltp = meta.regularMarketPrice;
          const previousClose = meta.previousClose;

          const change = ltp - previousClose;

          const changePercent =
            (change / previousClose) * 100;

          return {
            symbol: symbol === "HINDUNILVR.NS"
              ? "HUL"
              : symbol.replace(".NS", ""),
            ltp: ltp,
            change: change,
            changePercent: changePercent,
          };
        } catch (error) {
          console.log(`Error fetching ${symbol}:`, error);
          return null;
        }
      })
    );

    res.json(quotes.filter((quote) => quote !== null));
  } catch (error) {
    console.log("Market Quotes Error:", error);
    res.status(500).send("Market data error");
  }
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
  console.log("App started!");
  mongoose.connect(uri).then(()=>console.log("DB started!"))
  .catch((err)=>console.log(err))
  
});