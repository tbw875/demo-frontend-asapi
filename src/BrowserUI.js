import React from "react";
import "./BrowserUI.css";

function BrowserUI() {
  return (
    <div className="browser-container">
      <div className="browser-bar">
        <div className="circles">
          <div className="circle red"></div>
          <div className="circle yellow"></div>
          <div className="circle green"></div>
        </div>
        <div className="url-bar">https://your-defi-project.xyz</div>
      </div>
      <div className="browser-content">
        <button
          onClick={this.props.onConnectWallet}
          className="connect-wallet-btn"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

export default BrowserUI;
