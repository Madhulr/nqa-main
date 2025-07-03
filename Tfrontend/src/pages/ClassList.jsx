import React, { useState, useEffect } from 'react';
import { IoSearch } from "react-icons/io5";
import './ClassList.css';

const ClassList = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const sampleData = [
      {
        fullName: "John Doe",
        phone: "+91 98765 43210",
        email: "john.doe@example.com",
        packageCode: "PKG001",
        packageName: "Full Stack Development",
        batchCode: "BATCH001",
        packageCost: "₹ 50,000/-",
        amountPaid: "₹ 25,000/-",
        discount: "₹ 5,000/-",
        balanceAmount: "₹ 20,000/-",
        paymentCalling1: "Called on 01/01/2023",
        paymentCalling2: "Called on 01/02/2023",
        paymentCalling3: "Called on 01/03/2023",
        paymentCalling4: "Called on 01/04/2023",
        paymentCalling5: "Called on 01/05/2023",
        paymentStatus: "Pending",
      },
      {
        fullName: "Jane Smith",
        phone: "+91 87654 32109",
        email: "jane.smith@example.com",
        packageCode: "PKG002",
        packageName: "Data Science",
        batchCode: "BATCH002",
        packageCost: "₹ 60,000/-",
        amountPaid: "₹ 60,000/-",
        discount: "₹ 0/-",
        balanceAmount: "₹ 0/-",
        paymentCalling1: "Called on 01/01/2023",
        paymentCalling2: "Called on 01/02/2023",
        paymentCalling3: "Called on 01/03/2023",
        paymentCalling4: "Called on 01/04/2023",
        paymentCalling5: "Called on 01/05/2023",
        paymentStatus: "Complete",
      }
    ];
    setData(sampleData);
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (index, newStatus) => {
    const updatedData = [...data];
    updatedData[index].paymentStatus = newStatus;
    setData(updatedData);
  };

  const filteredData = data.filter(item =>
    item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="class-list-container">
      <div className="header">
        <h2>Class List</h2>
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search"
              aria-label="Search"
              role="searchbox"
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
              tabIndex={0}
            />
            <button className="search-button" tabIndex={0} aria-label="Search">
              <IoSearch />
            </button>
          </div>
        </form>
      </div>
      <div className="table-container">
        <table className="class-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Phone Number</th>
              <th>Email Address</th>
              <th>Package Code</th>
              <th>Package</th>
              <th>Batch Code</th>
              <th>Package Cost</th>
              <th>Amount Paid</th>
              <th>Discount</th>
              <th>Balance Amount</th>
              <th>Payment Calling 1</th>
              <th>Payment Calling 2</th>
              <th>Payment Calling 3</th>
              <th>Payment Calling 4</th>
              <th>Payment Calling 5</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 1 ? "alternate-row" : ""}>
                <td>{item.fullName}</td>
                <td>{item.phone}</td>
                <td>{item.email}</td>
                <td>{item.packageCode}</td>
                <td>{item.packageName}</td>
                <td>{item.batchCode}</td>
                <td className="text-right">{item.packageCost}</td>
                <td className="text-right">{item.amountPaid}</td>
                <td className="text-right">{item.discount}</td>
                <td className="text-right">{item.balanceAmount}</td>
                <td>{item.paymentCalling1}</td>
                <td>{item.paymentCalling2}</td>
                <td>{item.paymentCalling3}</td>
                <td>{item.paymentCalling4}</td>
                <td>{item.paymentCalling5}</td>
                <td>
                  <select
                    value={item.paymentStatus}
                    onChange={(e) => handleStatusChange(idx, e.target.value)}
                  >
                    <option value="Complete">Complete</option>
                    <option value="Pending">Pending</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassList;