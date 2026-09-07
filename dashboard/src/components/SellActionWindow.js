import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";

const SellActionWindow = ({ uid }) => {
  const generalContext = useContext(GeneralContext);

  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0);

  // ================= LIVE STOCK PRICE =================
  useEffect(() => {
    const fetchStockPrice = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3002/marketQuotes"
        );

        const liveStock = res.data.find(
          (stock) => stock.symbol === uid
        );

        if (liveStock) {
          setStockPrice(liveStock.ltp);
        }
      } catch (error) {
        console.log("Live Price Error:", error);
      }
    };

    fetchStockPrice();
  }, [uid]);

  // ================= SELL =================
  const handleSellClick = async () => {
    if (stockQuantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (stockPrice <= 0) {
      alert("Live price not available");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3002/newOrder",
        {
          name: uid,
          qty: Number(stockQuantity),
          price: Number(stockPrice),
          mode: "SELL",
        }
      );

      console.log("Sell response:", response.data);

      alert("Sell order placed successfully!");

      generalContext.closeSellWindow();
    } catch (error) {
      console.log("Sell Error:", error);

      alert(
        error.response?.data ||
        "Something went wrong"
      );
    }
  };

  // ================= CANCEL =================
  const handleCancelClick = () => {
    generalContext.closeSellWindow();
  };

  // ================= SELL VALUE =================
  const sellValue =
    Number(stockQuantity) * Number(stockPrice);

  return (
    <div
      className="container"
      id="buy-window"
      draggable="true"
    >
      <div className="regular-order">

        <div className="inputs">

          {/* Quantity */}
          <fieldset>
            <legend>Qty.</legend>

            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              onChange={(e) =>
                setStockQuantity(
                  Number(e.target.value)
                )
              }
              value={stockQuantity}
            />
          </fieldset>

          {/* Live Price */}
          <fieldset>
            <legend>Price</legend>

            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) =>
                setStockPrice(
                  Number(e.target.value)
                )
              }
              value={stockPrice}
            />
          </fieldset>

        </div>
      </div>

      <div className="buttons">

        <span>
          Sell value ₹
          {sellValue.toFixed(2)}
        </span>

        <div>

          <Link
            className="btn btn-blue"
            onClick={handleSellClick}
          >
            Sell
          </Link>

          <Link
            to=""
            className="btn btn-grey"
            onClick={handleCancelClick}
          >
            Cancel
          </Link>

        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;