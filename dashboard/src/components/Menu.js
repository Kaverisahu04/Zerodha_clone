import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

const Menu = () => {
  const [user, setUser] = useState(null);

useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
        fetch("http://localhost:3002/user", {
            headers: {
                Authorization: token,
            },
        })
        .then((response) => response.json())
        .then((data) => {
            console.log("USER DATA:", data);

            if (data.success) {
                setUser(data.user);

                // Dashboard ke localhost:3001 me user save
                localStorage.setItem("user", JSON.stringify(data.user));
                window.dispatchEvent(new Event("userUpdated"));
                window.history.replaceState({}, "", "/"); // Remove token from URL
            }
        })
        .catch((error) => {
            console.log("USER ERROR:", error);
        });
    } else {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        setUser(savedUser);
    }
}, []);

const username = user?.username;
const email = user?.email;
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  return (
    <div className="menu-container">
      <img src="logo1.png" style={{ width: "50px" }} />
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/positions"
              onClick={() => handleMenuClick(3)}
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/apps"
              onClick={() => handleMenuClick(6)}
            >
              <p className={selectedMenu === 6 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />
        <div className="profile" onClick={handleProfileClick}>
          <div className="avatar">
            {username ? username.charAt(0).toUpperCase() : "U"}
          </div>

          <p className="username">
            {username || "USERID"}
          </p>
        </div>
        {isProfileDropdownOpen && (
          <div className="profile-dropdown">
            <p style={{ color: "black", fontSize: "16px" }}>
              USERNAME: {username}
            </p>

            <p style={{ color: "black", fontSize: "16px" }}>
              EMAIL: {email}
            </p>

            <button
              onClick={() => {
                // alert("Logout button  clicked")
                localStorage.removeItem("user");
                window.location.href = "http://localhost:3000/login";
              }}
            >
              Logout
            </button>
          </div>
        )}
        {/* {isProfileDropdownOpen } */}
      </div>
    </div>
  );
};

export default Menu;