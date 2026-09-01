import React from "react";
import "./Apps.css";

const Apps = () => {
  const apps = [
    {
      name: "Kite",
      description: "Zerodha's trading platform for stocks and investments.",
      link: "https://kite.zerodha.com/"
    },
    {
      name: "Console",
      description: "Track your portfolio, trades, reports and investments.",
      link: "https://console.zerodha.com/"
    },
    {
      name: "Coin",
      description: "Invest in direct mutual funds online.",
      link: "https://coin.zerodha.com/"
    },
    {
      name: "Kite Connect",
      description: "Build trading applications using Zerodha APIs.",
      link: "https://kite.trade/"
    },
    {
      name: "Varsity",
      description: "Learn about stock markets and investing.",
      link: "https://zerodha.com/varsity/"
    }
  ];

  return (
    <div className="apps-container">
      <h2>Apps</h2>

      <div className="apps-grid">
        {apps.map((app) => (
          <div className="app-card" key={app.name}>
            <h3>{app.name}</h3>
            <p>{app.description}</p>

            <a
              href={app.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Apps;