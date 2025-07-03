import React, { useState, useEffect } from 'react';
import './DemoList.css';
import { IoSearch } from "react-icons/io5";

const DemoList = ({ isSidebarOpen }) => {
  const [demoData, setDemoData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setDemoData([
      { id: 1, name: 'John Doe', phone: '123-456-7890', email: 'john@example.com', code: 'MATH101', package: 'Basic', status: 'Completed' },
      { id: 2, name: 'Jane Smith', phone: '987-654-3210', email: 'jane@example.com', code: 'SCI202', package: 'Advanced', status: 'Pending' },
    ]);
  }, []);

  const handleMoveBackToEnquiryList = (id) => {
    const user = demoData.find((u) => u.id === id);
    setDemoData((prev) => prev.filter((u) => u.id !== id));
    console.log('Moved back to Enquiry List:', user);
  };

  const handleStatusChange = (id, newStatus) => {
    setDemoData((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: newStatus } : user
      )
    );
  };

  const filteredData = demoData.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`demo-list-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      <div className="header">
        <h2>Demo List</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search"
            aria-label="Search"
            role="searchbox"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            tabIndex={0}
          />
          <button className="search-button" tabIndex={0} aria-label="Search">
            <IoSearch />
          </button>
        </div>
      </div>
      <table className="demo-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Phone Number</th>
            <th>Email Address</th>
            <th>Package Code</th>
            <th>Package</th>
            <th>Demo Class Status</th>
            <th>Move?</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.phone}</td>
              <td>{user.email}</td>
              <td>{user.code}</td>
              <td>{user.package}</td>
              <td>
                <select
                  className="demo-status-select"
                  value={user.status}
                  onChange={(e) => handleStatusChange(user.id, e.target.value)}
                  style={{
                    width: '150px',
                    height: '35px',
                    padding: '5px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </td>
              <td>
                <button
                  className={`move-btn ${user.status !== 'Completed' ? 'disabled-btn' : ''}`}
                  disabled={user.status !== 'Completed'}
                  onClick={() => handleMoveBackToEnquiryList(user.id)}
                >
                  move
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DemoList;