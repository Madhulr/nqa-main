import React, { useState, useEffect } from 'react';
import './PlacementList.css';
import { IoSearch } from "react-icons/io5";

const PlacementList = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const sampleData = [
      {
        fullName: "John Doe",
        phone: "+91 98765 43210",
        email: "john.doe@example.com",
        startDate: "PKG001",
        salary: "Full Stack Development",
      },
      {
        fullName: "Jane Smith",
        phone: "+91 87654 32109",
        email: "jane.smith@example.com",
        startDate: "PKG002",
        salary: "Data Science",
      }
    ];
    setData(sampleData);
  }, []);

  const filteredData = data.filter(item =>
    item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="placement-list-container">
      <div className="header">
        <h2>Placement List</h2>
        <form className="search-form" onSubmit={e => e.preventDefault()}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search"
              aria-label="Search"
              role="searchbox"
              className="search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              tabIndex={0}
            />
            <button className="search-button" tabIndex={0} aria-label="Search">
              <IoSearch />
            </button>
          </div>
        </form>
      </div>
      <div className="table-container">
        <table className="placement-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Phone Number</th>
              <th>Email Address</th>
              <th>Package Code</th>
              <th>Package</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 1 ? "alternate-row" : ""}>
                <td>{item.fullName}</td>
                <td>{item.phone}</td>
                <td>{item.email}</td>
                <td>{item.startDate}</td>
                <td className="text-right">{item.salary}</td>
                <td>
                  <button className="view-more-button">View More</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlacementList;