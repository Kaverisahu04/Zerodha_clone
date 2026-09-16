import React, { useState, useContext, useEffect } from "react";
import axios from "axios";

import GeneralContext from "./GeneralContext";

import { Tooltip, Grow } from "@mui/material";

import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

import { watchlist } from "../data/data";
import { DoughnutChart } from "./DoughnoutChart";

const WatchList = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= LIVE MARKET DATA =================

  const fetchQuotes = async () => {
    try {
      const res = await axios.get(
        "https://zerodha-backend-14si.onrender.com/marketQuotes"
      );

      console.log("Live Market Quotes:", res.data);

      setQuotes(res.data);
      setLoading(false);
    } catch (error) {
      console.log("Market Quotes Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();

    // Refresh every 30 seconds
    const interval = setInterval(fetchQuotes, 30000);

    return () => clearInterval(interval);
  }, []);

  // ================= COMBINE WATCHLIST + LIVE DATA =================

  const updatedWatchlist = watchlist.map((stock) => {
    const liveStock = quotes.find(
      (quote) => quote.symbol === stock.name
    );

    return {
      ...stock,

      price: liveStock ? liveStock.ltp : null,

      percent: liveStock
        ? `${liveStock.changePercent >= 0 ? "+" : ""}${liveStock.changePercent.toFixed(2)}%`
        : "--",

      isDown: liveStock
        ? liveStock.change < 0
        : false,
    };
  });

  // ================= CHART DATA =================

  const labels = updatedWatchlist.map(
    (stock) => stock.name
  );

  const data = {
    labels,

    datasets: [
      {
        label: "Price",

        data: updatedWatchlist.map(
          (stock) => stock.price || 0
        ),

        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],

        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],

        borderWidth: 1,
      },
    ],
  };

  // ================= UI =================

  return (
    <div className="watchlist-container">

      {/* Search */}
      <div className="search-container">

        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />

        <span className="counts">
          {watchlist.length} / 50
        </span>

      </div>

      {/* Watchlist */}
      <ul className="list">

        {updatedWatchlist.map((stock, index) => (
          <WatchListItem
            stock={stock}
            loading={loading}
            key={index}
          />
        ))}

      </ul>

      {/* Chart */}
      <DoughnutChart data={data} />

    </div>
  );
};

export default WatchList;


// ======================================================
// WATCHLIST ITEM
// ======================================================

const WatchListItem = ({ stock, loading }) => {

  const [showWatchlistActions, setShowWatchlistActions] =
    useState(false);

  const handleMouseEnter = () => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = () => {
    setShowWatchlistActions(false);
  };

  return (
    <li
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      <div className="item">

        {/* Stock Name */}
        <p className={stock.isDown ? "down" : "up"}>
          {stock.name}
        </p>

        <div className="itemInfo">

          {/* Percentage */}
          <span className="percent">

            {loading
              ? "Loading..."
              : stock.percent}

          </span>

          {/* Arrow */}
          {!loading && stock.price !== null && (
            stock.isDown ? (
              <KeyboardArrowDown className="down" />
            ) : (
              <KeyboardArrowUp className="up" />
            )
          )}

          {/* Price */}
          <span className="price">

            {loading
              ? "..."
              : stock.price !== null
                ? `₹${Number(stock.price).toFixed(2)}`
                : "--"}

          </span>

        </div>

      </div>

      {/* Actions */}
      {showWatchlistActions && (
        <WatchListActions uid={stock.name} />
      )}

    </li>
  );
};


// ======================================================
// WATCHLIST ACTIONS
// ======================================================

const WatchListActions = ({ uid }) => {

  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid);
  };

  const handleSellClick = () => {
    generalContext.openSellWindow(uid);
  };

  return (
    <span className="actions">

      <span>

        {/* BUY */}
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button
            className="buy"
            onClick={handleBuyClick}
          >
            Buy
          </button>
        </Tooltip>


        {/* SELL */}
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button
            className="sell"
            onClick={handleSellClick}
          >
            Sell
          </button>
        </Tooltip>


        {/* ANALYTICS */}
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>


        {/* MORE */}
        <Tooltip
          title="More"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>

      </span>

    </span>
  );
};