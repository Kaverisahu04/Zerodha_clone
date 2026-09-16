import React, { useState, useEffect } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [quotes, setQuotes] = useState([]);

  // Holdings DB se
  const fetchHoldings = async () => {
    try {
      const res = await axios.get("https://zerodha-backend-14si.onrender.com/allHoldings");
      console.log("Holdings:", res.data);
      setAllHoldings(res.data);
    } catch (error) {
      console.log("Holdings Error:", error);
    }
  };

  // Live market prices
  const fetchQuotes = async () => {
    try {
      const res = await axios.get("https://zerodha-backend-14si.onrender.com/marketQuotes");
      console.log("Live Quotes:", res.data);
      setQuotes(res.data);
    } catch (error) {
      console.log("Quotes Error:", error);
    }
  };

  useEffect(() => {
    fetchHoldings();
    fetchQuotes();

    // Har 30 seconds me live price update
    const interval = setInterval(() => {
      fetchQuotes();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // DB holdings + live price ko combine karna
  const updatedHoldings = allHoldings.map((stock) => {
    const liveStock = quotes.find(
      (quote) => quote.symbol === stock.name
    );

    return {
      ...stock,
      livePrice: liveStock ? liveStock.ltp : stock.price,
      dayChange: liveStock
        ? liveStock.changePercent
        : 0,
    };
  });

  // Total Investment
  const totalInvestment = updatedHoldings.reduce(
    (total, stock) => total + stock.avg * stock.qty,
    0
  );

  // Current Value
  const currentValue = updatedHoldings.reduce(
    (total, stock) => total + stock.livePrice * stock.qty,
    0
  );

  // Total P&L
  const totalProfitLoss = currentValue - totalInvestment;

  // Total P&L %
  const totalProfitLossPercentage =
    totalInvestment > 0
      ? (totalProfitLoss / totalInvestment) * 100
      : 0;

  // Graph data
  const labels = updatedHoldings.map(
    (stock) => stock.name
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Current Value",
        data: updatedHoldings.map(
          (stock) => stock.livePrice * stock.qty
        ),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <>
      <h3 className="title">
        Holdings ({updatedHoldings.length})
      </h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
            </tr>
          </thead>

          <tbody>
            {updatedHoldings.map((stock, index) => {
              const investment =
                stock.avg * stock.qty;

              const currentStockValue =
                stock.livePrice * stock.qty;

              const profitLoss =
                currentStockValue - investment;

              const profitLossPercentage =
                investment > 0
                  ? (profitLoss / investment) * 100
                  : 0;

              const profitClass =
                profitLoss >= 0
                  ? "profit"
                  : "loss";

              const dayClass =
                stock.dayChange >= 0
                  ? "profit"
                  : "loss";

              return (
                <tr key={index}>
                  <td>{stock.name}</td>

                  <td>{stock.qty}</td>

                  <td>
                    ₹{stock.avg.toFixed(2)}
                  </td>

                  <td>
                    ₹{Number(stock.livePrice).toFixed(2)}
                  </td>

                  <td>
                    ₹{currentStockValue.toFixed(2)}
                  </td>

                  <td className={profitClass}>
                    ₹{profitLoss.toFixed(2)}
                  </td>

                  <td className={profitClass}>
                    {profitLossPercentage >= 0
                      ? "+"
                      : ""}
                    {profitLossPercentage.toFixed(2)}%
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

      {/* Total Summary */}
      <div className="row">
        <div className="col">
          <h5>
            ₹{totalInvestment.toFixed(2)}
          </h5>
          <p>Total investment</p>
        </div>

        <div className="col">
          <h5>
            ₹{currentValue.toFixed(2)}
          </h5>
          <p>Current value</p>
        </div>

        <div className="col">
          <h5 className={
            totalProfitLoss >= 0
              ? "profit"
              : "loss"
          }>
            ₹{totalProfitLoss.toFixed(2)}{" "}
            ({totalProfitLossPercentage >= 0
              ? "+"
              : ""}
            {totalProfitLossPercentage.toFixed(2)}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>

      {/* Graph */}
      <VerticalGraph data={data} />
    </>
  );
};

export default Holdings;