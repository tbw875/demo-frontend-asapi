import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ethers } from "ethers";

import hljs from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/atom-one-dark.css";
hljs.registerLanguage("javascript", javascript);

function App() {
  const [responseData, setResponseData] = useState(null);
  const [address, setAddress] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const connect = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        console.log(`Wallet: ${address}`);
        toast.success(`Wallet connected: ${address}`);
        setAddress(address);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("No Ethereum browser extension detected, install MetaMask!");
    }
  };

  const disconnect = () => {
    console.log("Wallet disconnected");
    toast.warn("Wallet disconnected");
    setAddress("");
  };

  // goToNextStep() increments the currentStep state variable by 1
  // For use on button click
  const goToNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  /*
  Due to CORS policy, we can't make POST requests directly from the frontend.
  Instead, we'll make a POST request to our backend, which will then make the POST request to the Chainalysis API.
  */

  const handlePostRequest = async () => {
    const apiEndpoint = "http://localhost:3001/api/entities";
    console.log("API Key:", process.env.REACT_APP_API_KEY);
    console.log("Address:", address);
    try {
      const response = await axios.post(
        apiEndpoint,
        {
          address: address,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Token: process.env.REACT_APP_API_KEY,
          },
        }
      );

      setResponseData(response.data);

      if (response.status === 200 && response.data.address) {
        toast.success(
          `POST request was successful for address: ${response.data.address}`
        );
      } else {
        toast.error(
          "POST request was successful, but unexpected response format."
        );
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Error in POST request: ${error.response.status}`);
        console.log(error);
      } else {
        // The request was made but no response was received or an error occurred setting up the request
        toast.error(`Error in POST request: ${error.message}`);
        console.log(error);
      }
    }
  };

  const handleGetRequest = async () => {
    const apiEndpoint = `http://localhost:3001/api/entities/${address}`;
    try {
      console.log(`Making GET request to ${apiEndpoint}`);
      const response = await axios.get(apiEndpoint, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setResponseData(response.data);
      toast.success("GET request was successful!");

      // Insert data into the database
      try {
        const insertEndpoint = "http://localhost:3001/api/insert";
        await axios.post(insertEndpoint, {
          address: response.data.address,
          risk: response.data.risk,
          data: response.data,
        });
        toast.success("Data successfully stored in the database");
      } catch (insertError) {
        toast.error(
          `Error storing data in the database: ${insertError.message}`
        );
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Error in GET request: ${error.response.status}`);
        console.log(error.response.data);
      } else {
        // The request was made but no response was received or an error occurred setting up the request
        toast.error(`Error in GET request: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    hljs.highlightAll();
  }, [address, responseData, currentStep]);

  return (
    <>
      <ToastContainer />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/web3/1.7.4-rc.1/web3.min.js"></script>
      <div className="container">
        <div className="browser-container">
          <div className="browser-bar">
            <div className="circles">
              <div className="circle red"></div>
              <div className="circle yellow"></div>
              <div className="circle green"></div>
            </div>
            <div className="url-bar">https://www.lime-defi.xyz</div>
          </div>
          <div className="main-container">
            {/* Sidebar */}
            <div className="sidebar">
              <div className="sidebar-header">
                <img src="lime-logo.png" alt="Li.me DeFi" width="150px" />
              </div>
              <button className="sidebar-btn">Dashboard</button>
              <button className="sidebar-btn">Settings</button>
              <button className="sidebar-btn">Vaults</button>
              <button className="sidebar-btn">DAO</button>
              <button className="sidebar-btn">Documentation</button>
              {/* Add more sidebar buttons here */}
            </div>

            {/* Main Content */}
            <div className="content">
              {address ? (
                <>
                  <p>Wallet Connected: {address}</p>
                  <button
                    onClick={disconnect}
                    className="disconnect-wallet-btn"
                  >
                    Disconnect Wallet
                  </button>
                </>
              ) : (
                <button onClick={connect} className="connect-wallet-btn">
                  Connect Wallet
                </button>
              )}

              {/* TODO: Remove inline styles to a css class*/}
              <div
                style={{
                  marginTop: "30px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  padding: "15px",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    color: "#8BC53D",
                    fontWeight: "bold",
                    marginBottom: "15px",
                    fontSize: "20px",
                  }}
                >
                  Lime Protocol Metrics:
                </div>
                <div
                  as="ul"
                  style={{
                    color: "#8BC53D",
                    padding: "0",
                    margin: "0",
                    listStyleType: "none",
                    fontSize: "18px",
                  }}
                >
                  <div as="li">APR: 5.6%</div>
                  <div as="li">Liquidity Pool: $1,000,000</div>
                  <div as="li">Total Value Locked: $500,000</div>
                  <div as="li">Compliance: 100%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="right-pane">
          <h2 style={{ marginTop: "0px", marginBottom: "5px" }}>
            Your Backend Workflow
          </h2>
          {/* New form for inputting address */}
          <form className="address-form">
            <label>
              Manual Address Input:
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  marginRight: "10px",
                  marginBottom: "5px",
                  flex: 1,
                  maxWidth: "calc(100% - 40px)",
                }}
              />
            </label>
          </form>

          {address && (
            <p style={{ marginTop: "0px", marginBottom: "0px" }}>
              Connected Address: {address}
            </p>
          )}

          {currentStep === 1 && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ marginBottom: "0px" }}>
                Step 1: Register the address with Chainalysis via POST
              </h3>
              <pre className="code-container">
                <code>
                  {`// Import Axios and fetch the user's address from ThirdWeb
var axios = require('axios')
var data = "{ address: "${address}" }"

// Set up the POST request
// API Key is in a .env file
// Pass the address in the request body as 'data'
var config = {
  method: 'post',
  url: 'https://api.chainalysis.com/api/risk/v2/entities',
  headers: { 
    'Content-Type': 'application/json', 
    'Token': {process.env.API_KEY}
  },
  data : data
};

// Make the POST request
axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});`}
                </code>
              </pre>
              <button
                onClick={() => handlePostRequest("POST")}
                className="button"
              >
                POST
              </button>
              {/* Step 3: Display the POST response */}

              {responseData && (
                <>
                  <p style={{ marginTop: "10px" }}>
                    After the address is registered, the server will return the
                    address registered. This response is just a confirmation, no
                    need to store this data.
                  </p>
                  <pre
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#f0f0f0",
                      padding: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    <code>{JSON.stringify(responseData, null, 2)}</code>
                  </pre>
                  <button className="button" onClick={() => goToNextStep()}>
                    Next
                  </button>
                </>
              )}
            </div>
          )}
          {currentStep === 2 && (
            <>
              <h3>Step 3: Send GET request & retrieve data</h3>
              <p>Build a GET request with the user's address in-line:</p>
              <pre className="code-container">
                <code>
                  {`var config = {
  method: 'get',
  url: 'https://api.chainalysis.com/api/risk/v2/entities/${address}',
  headers: { 
    'Content-Type': 'application/json', 
    'Token': 'process.env.API_KEY'
  },
  data : data
};`}
                </code>
              </pre>
              <button
                onClick={() => handleGetRequest("GET")}
                className="button"
              >
                GET
              </button>
              {responseData && (
                <>
                  <p style={{ marginTop: "10px" }}>
                    The server responds with a JSON object containing the risk
                    attributes of the address. In our example, we'll store the
                    entire JSON object in our database for future reference and
                    comparison.
                  </p>
                  <pre className="code-container">
                    <code>{JSON.stringify(responseData, null, 2)}</code>
                  </pre>
                  <button onClick={() => goToNextStep()} className="button">
                    Next
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
