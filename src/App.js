import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import {
  ThirdwebProvider,
  ConnectWallet,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
} from "@thirdweb-dev/react";

function App() {
  const [address, setAddress] = useState("");
  const [responseData, setResponseData] = useState(null);

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

  return (
    <ThirdwebProvider
      activeChain="polygon"
      clientId="da67985796103cccc170eb42e81de46b"
      supportedWallets={[metamaskWallet(), coinbaseWallet(), walletConnect()]}
    >
      <div className="container">
        <h1>Welcome to Cryptocurrency Address Checker</h1>

        <ConnectWallet theme={"dark"} />

        <div>
          <label>
            Enter Address:
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <button onClick={handlePostRequest}>POST</button>
          <button onClick={handleGetRequest}>GET</button>
        </div>

        {responseData && (
          <pre className="json-response">
            {JSON.stringify(responseData, null, 2)}
          </pre>
        )}

        <ToastContainer />
      </div>
    </ThirdwebProvider>
  );
}

export default App;
