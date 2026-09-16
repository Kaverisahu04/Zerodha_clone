import React, { useEffect, useState } from "react";
import axios from "axios";

const Summary = () => {
  const [username, setUsername] = useState("");
  const [funds, setFunds] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [quotes, setQuotes] = useState([]);

  // ================= USER =================
  useEffect(() => {
    const getUser = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      setUsername(user?.username || "");
    };

    getUser();

    window.addEventListener("userUpdated", getUser);

    return () => {
      window.removeEventListener("userUpdated", getUser);
    };
  }, []);

  // ================= FUNDS =================
  const fetchFunds = async () => {
    try {
      const res = await axios.get(
        "https://zerodha-backend-14si.onrender.com/allFunds"
      );

      console.log("Funds:", res.data);
      setFunds(res.data);
    } catch (error) {
      console.log("Funds Error:", error);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  // ================= HOLDINGS =================
  const fetchHoldings = async () => {
    try {
      const res = await axios.get(
        "https://zerodha-backend-14si.onrender.com/allHoldings"
      );

      console.log("Holdings:", res.data);
      setHoldings(res.data);
    } catch (error) {
      console.log("Holdings Error:", error);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  // ================= LIVE MARKET QUOTES =================
  const fetchQuotes = async () => {
    try {
      const res = await axios.get(
        "https://zerodha-backend-14si.onrender.com/marketQuotes"
      );

      console.log("Live Quotes:", res.data);
      setQuotes(res.data);
    } catch (error) {
      console.log("Quotes Error:", error);
    }
  };

  useEffect(() => {
    fetchQuotes();

    // Every 30 seconds live price update
    const interval = setInterval(() => {
      fetchQuotes();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ================= COMBINE HOLDINGS + LIVE PRICE =================
  const updatedHoldings = holdings.map((stock) => {
    const liveStock = quotes.find(
      (quote) => quote.symbol === stock.name
    );

    return {
      ...stock,
      livePrice: liveStock
        ? liveStock.ltp
        : stock.price,
    };
  });

  // ================= LOADING =================
  if (!funds) {
    return <h3>Loading...</h3>;
  }

  // ================= HOLDINGS CALCULATIONS =================

  let totalInvestment = 0;
  let currentValue = 0;

  updatedHoldings.forEach((stock) => {
    totalInvestment += stock.avg * stock.qty;

    currentValue +=
      stock.livePrice * stock.qty;
  });

  // ================= TOTAL P&L =================

  const totalProfitLoss =
    currentValue - totalInvestment;

  // ================= P&L PERCENTAGE =================

  const profitLossPercentage =
    totalInvestment > 0
      ? (totalProfitLoss / totalInvestment) * 100
      : 0;

  const profitClass =
    totalProfitLoss >= 0
      ? "profit"
      : "loss";

  // ================= UI =================

  return (
    <>
      {/* ================= USERNAME ================= */}

      <div className="username">
        <h6>Hi, {username}!</h6>

        <hr className="divider" />
      </div>

      {/* ================= EQUITY ================= */}

      <div className="section">

        <span>
          <p>Equity</p>
        </span>

        <div className="data">

          <div className="first">

            <h3>
              ₹{funds.availableCash.toFixed(2)}
            </h3>

            <p>Margin available</p>

          </div>

          <hr />

          <div className="second">

            <p>
              Margins used{" "}

              <span>
                ₹{funds.usedMargin.toFixed(2)}
              </span>
            </p>

            <p>
              Opening balance{" "}

              <span>
                ₹{funds.openingBalance.toFixed(2)}
              </span>
            </p>

          </div>

        </div>

        <hr className="divider" />

      </div>

      {/* ================= HOLDINGS ================= */}

      <div className="section">

        <span>
          <p>
            Holdings ({updatedHoldings.length})
          </p>
        </span>

        <div className="data">

          <div className="first">

            <h3 className={profitClass}>

              ₹{totalProfitLoss.toFixed(2)}

              <small>
                {" "}

                {totalProfitLoss >= 0
                  ? "+"
                  : ""}

                {profitLossPercentage.toFixed(2)}%

              </small>

            </h3>

            <p>P&L</p>

          </div>

          <hr />

          <div className="second">

            <p>
              Current Value{" "}

              <span>
                ₹{currentValue.toFixed(2)}
              </span>
            </p>

            <p>
              Investment{" "}

              <span>
                ₹{totalInvestment.toFixed(2)}
              </span>
            </p>

          </div>

        </div>

        <hr className="divider" />

      </div>
    </>
  );
};

export default Summary;