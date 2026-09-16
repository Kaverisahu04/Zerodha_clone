import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Funds = () => {
  // ================= STATES =================
  const navigate = useNavigate();

  const [funds, setFunds] = useState(null);

  const [amount, setAmount] = useState("");

  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // ================= GET FUNDS =================

  const fetchFunds = async () => {
    try {
      const res = await axios.get("http://localhost:3002/allFunds");
      console.log(res.data);
      setFunds(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Page load hote hi funds fetch honge
  useEffect(() => {
    fetchFunds();
  }, []);

  // ================= ADD FUNDS =================

  const handleAddFunds = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      await axios.post("http://localhost:3002/addFunds", {
        amount: Number(amount),
      });

      alert("Funds added successfully!");

      // Input clear
      setAmount("");

      // Popup close
      setShowAddFunds(false);

      // Updated funds database se fetch
      fetchFunds();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data || "Something went wrong"
      );
    }
  };

  // ================= WITHDRAW FUNDS =================

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      await axios.post("http://localhost:3002/withdrawFunds", {
        amount: Number(amount),
      });

      alert("Funds withdrawn successfully!");

      // Input clear
      setAmount("");

      // Popup close
      setShowWithdraw(false);

      // Updated funds database se fetch
      fetchFunds();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data || "Something went wrong"
      );
    }
  };

  // ================= LOADING =================

  if (!funds) {
    return <h3>Loading funds...</h3>;
  }

  // ================= UI =================

  return (
    <>
      {/* ================= TOP SECTION ================= */}

      <div className="funds">

        <p>
          Instant, zero-cost fund transfers with UPI
        </p>

        <button
          className="btn btn-green"
          onClick={() => {
            setShowAddFunds(true);
            setShowWithdraw(false);
            setAmount("");
          }}
        >
          Add funds
        </button>

        <button
          className="btn btn-blue"
          onClick={() => {
            setShowWithdraw(true);
            setShowAddFunds(false);
            setAmount("");
          }}
        >
          Withdraw
        </button>

      </div>


      {/* ================= ADD FUNDS ================= */}

      {showAddFunds && (
        <div className="fund-action">

          <h4>Add Funds</h4>

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            className="btn btn-green"
            onClick={handleAddFunds}
          >
            Add
          </button>

          <button
            className="btn"
            onClick={() => {
              setShowAddFunds(false);
              setAmount("");
            }}
          >
            Cancel
          </button>

        </div>
      )}


      {/* ================= WITHDRAW ================= */}

      {showWithdraw && (
        <div className="fund-action">

          <h4>Withdraw Funds</h4>

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            className="btn btn-blue"
            onClick={handleWithdraw}
          >
            Withdraw
          </button>

          <button
            className="btn"
            onClick={() => {
              setShowWithdraw(false);
              setAmount("");
            }}
          >
            Cancel
          </button>

        </div>
      )}


      {/* ================= FUNDS DETAILS ================= */}

      <div className="row">

        {/* ================= EQUITY ================= */}

        <div className="col">

          <span>
            <p>Equity</p>
          </span>

          <div className="table">

            <div className="data">
              <p>Available margin</p>

              <p className="imp colored">
                ₹{funds.availableCash.toFixed(2)}
              </p>
            </div>


            <div className="data">
              <p>Used margin</p>

              <p className="imp">
                ₹{funds.usedMargin.toFixed(2)}
              </p>
            </div>


            <div className="data">
              <p>Available cash</p>

              <p className="imp">
                ₹{funds.availableCash.toFixed(2)}
              </p>
            </div>


            <hr />


            <div className="data">
              <p>Opening Balance</p>

              <p>
                ₹{funds.openingBalance.toFixed(2)}
              </p>
            </div>


            <div className="data">
              <p>Payin</p>

              <p>₹0.00</p>
            </div>


            <div className="data">
              <p>SPAN</p>

              <p>₹0.00</p>
            </div>


            <div className="data">
              <p>Delivery margin</p>

              <p>₹0.00</p>
            </div>


            <div className="data">
              <p>Exposure</p>

              <p>₹0.00</p>
            </div>


            <div className="data">
              <p>Options premium</p>

              <p>₹0.00</p>
            </div>


            <hr />


            <div className="data">
              <p>Collateral (Liquid funds)</p>

              <p>₹0.00</p>
            </div>


            <div className="data">
              <p>Collateral (Equity)</p>

              <p>₹0.00</p>
            </div>


            <div className="data">
              <p>Total Collateral</p>

              <p>₹0.00</p>
            </div>

          </div>

        </div>


        {/* ================= COMMODITY ================= */}

        <div className="col">

          <div className="commodity">

            <p>
              You don't have a commodity account
            </p>

            <button
  onClick={() => navigate("/signup")}
  className="btn btn-blue"
>
  Open Account
</button>

          </div>

        </div>

      </div>

    </>
  );
};

export default Funds;