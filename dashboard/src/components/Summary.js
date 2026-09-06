import React, { useEffect, useState } from "react";
import axios from "axios";

const Summary = () => {
  const [username, setUsername] = useState("");

  const [funds, setFunds] = useState(null);
  const [holdings, setHoldings] = useState([]);

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

  useEffect(() => {
    axios
      .get("http://localhost:3002/allFunds")
      .then((res) => {
        console.log("Funds:", res.data);
        setFunds(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // ================= HOLDINGS =================

  useEffect(() => {
    axios
      .get("http://localhost:3002/allHoldings")
      .then((res) => {
        console.log("Holdings:", res.data);
        setHoldings(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // ================= LOADING =================

  if (!funds) {
    return <h3>Loading...</h3>;
  }

  // ================= HOLDINGS CALCULATIONS =================

  let totalInvestment = 0;
  let currentValue = 0;

  holdings.forEach((stock) => {
    totalInvestment += stock.avg * stock.qty;
    currentValue += stock.price * stock.qty;
  });

  // Total P&L
  const totalProfitLoss = currentValue - totalInvestment;

  // P&L percentage
  const profitLossPercentage =
    totalInvestment > 0
      ? (totalProfitLoss / totalInvestment) * 100
      : 0;

  const profitClass =
    totalProfitLoss >= 0 ? "profit" : "loss";

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
            Holdings ({holdings.length})
          </p>
        </span>

        <div className="data">

          <div className="first">

            <h3 className={profitClass}>

              ₹{totalProfitLoss.toFixed(2)}

              <small>
                {" "}
                {totalProfitLoss >= 0 ? "+" : ""}
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