import React, { useState, useEffect } from "react";
import axios from "axios";

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [quotes, setQuotes] = useState([]);

  // Positions database se fetch
  const fetchPositions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3002/allPositions"
      );

      console.log("Positions:", res.data);
      setPositions(res.data);
    } catch (error) {
      console.log("Positions Error:", error);
    }
  };

  // Live market prices fetch
  const fetchQuotes = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3002/marketQuotes"
      );

      console.log("Live Quotes:", res.data);
      setQuotes(res.data);
    } catch (error) {
      console.log("Quotes Error:", error);
    }
  };

  useEffect(() => {
    fetchPositions();
    fetchQuotes();

    // Har 30 seconds me live price update
    const interval = setInterval(() => {
      fetchQuotes();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Position + Live market price combine
  const updatedPositions = positions.map((stock) => {
    const liveStock = quotes.find(
      (quote) => quote.symbol === stock.name
    );

    return {
      ...stock,
      livePrice: liveStock
        ? liveStock.ltp
        : stock.price,

      dayChange: liveStock
        ? liveStock.changePercent
        : 0,
    };
  });

  return (
    <>
      <h3 className="title">
        Positions ({updatedPositions.length})
      </h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg.</th>
              <th>LTP</th>
              <th>P&L</th>
              <th>Chg.</th>
            </tr>
          </thead>

          <tbody>
            {updatedPositions.map((stock, index) => {
              // Investment
              const investment =
                stock.avg * stock.qty;

              // Current value using LIVE price
              const curValue =
                stock.livePrice * stock.qty;

              // P&L
              const profitLoss =
                curValue - investment;

              // P&L %
              const profitLossPercentage =
                investment > 0
                  ? (profitLoss / investment) * 100
                  : 0;

              const profClass =
                profitLoss >= 0
                  ? "profit"
                  : "loss";

              const dayClass =
                stock.dayChange >= 0
                  ? "profit"
                  : "loss";

              return (
                <tr key={index}>
                  <td>{stock.product}</td>

                  <td>{stock.name}</td>

                  <td>{stock.qty}</td>

                  <td>
                    ₹{stock.avg.toFixed(2)}
                  </td>

                  <td>
                    ₹{Number(stock.livePrice).toFixed(2)}
                  </td>

                  <td className={profClass}>
                    ₹{profitLoss.toFixed(2)}
                    {" "}
                    ({profitLossPercentage >= 0
                      ? "+"
                      : ""}
                    {profitLossPercentage.toFixed(2)}%)
                  </td>

                  <td className={dayClass}>
                    {stock.dayChange >= 0
                      ? "+"
                      : ""}
                    {stock.dayChange.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Positions;