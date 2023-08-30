# Demo - Address Checker / Storer

This demo attempts to show how a Chainalysis Address Screening API customer can utilize the API in their platform. No matter the implementation the customer has to fetch a user's address, you paste the address in the form as a simulation of fetching (In reality, this would be fetched from the connect-wallet infrastructure or other methods). The app then gives you the ability to POST the address to start monitoring it, and then GET the results. This will then return the results of the GET request to the UI for visualization. We also store the results of the query to a database, and have functionality to make a decision based on the risk factors presented. 

### Setup
 
To run this on your local, clone the repository and run both the server and front end packages:

1. Navigate to the root directory
2. Create a `.env` file with the following information:
    * `REACT_APP_API_KEY`

3. In a terminal, do `npm start`
4. Navigate to `/server`
5. Download and install PostgreSQL. Create a login and save the password for step 6. Create a database named `screen-db`
6. Create a `.env` file with the following information:
    * `SERVER_API_KEY` (This can be the same as your `REACT_APP_API_KEY`)
    * `DB_PASSWORD` (This is the password you specify after setting up a postgres server)
7. In another terminal, do `node index.js`

This starts two instances:
* Frontend running at `http://localhost:3000`
* Server running at `http://localhost:3001`

Paste an address and get screening!


### Questions/Comments/Contact

Tom Walsh
tom.walsh@chainalysis.com