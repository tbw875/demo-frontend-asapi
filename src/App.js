import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  CssBaseline,
} from "@mui/material";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import {
  ThirdwebProvider,
  ConnectWallet,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  useAddress,
} from "@thirdweb-dev/react";

function AddressHandler({ address, setAddress }) {
  const connectedAddress = useAddress();

  useEffect(() => {
    if (connectedAddress) {
      setAddress(connectedAddress);
    }
  }, [connectedAddress, setAddress]);

  return null;
}

function App() {
  const [responseData, setResponseData] = useState(null);
  const [address, setAddress] = useState("");

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <ThirdwebProvider
          activeChain="polygon"
          clientId="YOUR_CLIENT_ID_HERE"
          supportedWallets={[
            metamaskWallet(),
            coinbaseWallet(),
            walletConnect(),
          ]}
        >
          <AddressHandler setAddress={setAddress} />
          <Container>
            <Typography variant="h3">
              Chainalysis DeFi Wallet Screen Demo
            </Typography>
            <Typography variant="body1" gutterBottom>
              Step 1: User connects their wallet to the dApp
            </Typography>
            <ConnectWallet className="connect-wallet-btn" theme={"dark"} />
            <Typography variant="body1" gutterBottom>
              Step 2: We fetch the wallet address via ThirdWeb:
            </Typography>
            <Typography variant="body2" gutterBottom>
              {/* Code Example */}
              <pre>
                {`
                import { useAddress } from "@thirdweb-dev/react";
                const address = useAddress();
              `}
              </pre>
            </Typography>
            <AddressHandler address={address} setAddress={setAddress} />

            <Typography variant="body1">
              This returns the current connected address.
              <br />
              Address: {address || "Wallet not connected"}
              <br />
              Step 3: We pass the address in the body of a POST request to
              register the address to screen:
            </Typography>
            <Typography variant="body2" gutterBottom>
              {/* Code Example */}
              <pre>
                {`
                const handlePostRequest = async () => {
                  const response = await axios.post(
                    "https://api.chainalysis.com/api/risk/v2/entities",
                    {address: "${address || "your_address_here"}",},
                    {headers: {
                        "Content-Type": "application/json",
                        Token: process.env.REACT_APP_API_KEY},
                    }
                  );
              `}
              </pre>
              And then run the POST request:
            </Typography>
            <div>
              <TextField
                label="Enter Address"
                variant="outlined"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handlePostRequest}
              >
                POST
              </Button>
              <Typography>
                The address is now registered. The API returns a JSON with the
                body that you sent, as confirmation.
              </Typography>
              <Typography>
                Step 4: Build a GET request to receive screening information.
                <br />
                Instead of passing the address in the body, the address is
                passed in-line in the request URL:
              </Typography>
              <Typography variant="body2" gutterBottom>
                {/* Code Example */}
                <pre>
                  {`
                const handleGetRequest = async () => {
                  const response = await axios.get(
                    "https://api.chainalysis.com/api/risk/v2/entities/${address}",
                    {headers: {
                        "Content-Type": "application/json",
                        Token: process.env.REACT_APP_API_KEY},
                    }
                  );
              `}
                </pre>
                By sending the GET request, we receive a JSON payload of risk
                information for the address:
              </Typography>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleGetRequest}
              >
                GET
              </Button>
            </div>

            {responseData && (
              <pre className="json-response">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            )}

            <ToastContainer />
          </Container>
        </ThirdwebProvider>
      </Box>
    </ThemeProvider>
  );
}

export default App;
