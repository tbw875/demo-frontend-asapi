import React, { useState, useEffect } from "react";
import axios from "axios";

const DatabasePage = () => {
  const [dbData, setDbData] = useState([]);

  // Fetching the data from the database when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/fetch-last-five"
        );
        setDbData(response.data);
      } catch (error) {
        console.error("There was an error fetching the data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Last Five Records in Database</h2>

      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Risk</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {dbData.map((row, index) => (
            <tr key={index}>
              <td>{row.address}</td>
              <td>{row.risk}</td>
              <td>{JSON.stringify(row.data)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DatabasePage;
