import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DemoList.css';
import { IoSearch } from "react-icons/io5";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';

const DemoList1 = () => {
  const navigate = useNavigate();
  const staticData = [
    {
      name: 'Rohan Iyer',
      phone: '+91 56785 43210',
      email: 'rohan.iyer@example.com',
      packageCode: 'MRS005',
      package: 'MERN Stack',
      cost: '₹ 40,999 /-',
      paid: '₹ 20,999 /-',
      discount: '₹ 5,000 /-',
      balance: '₹ 15,000 /-',
    },
    {
      name: 'Meera Nambiar',
      phone: '+91 51234 56789',
      email: 'meera.n@example.com',
      packageCode: 'DA0005',
      package: 'Data Analytics',
      cost: '₹ 20,999 /-',
      paid: '₹ 19,000 /-',
      discount: '₹ 1,000 /-',
      balance: '₹ 999 /-',
    },
  ];

  const [backendData, setBackendData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const response = await axios.get('/api/demo-data');
        setBackendData(response.data);
      } catch (error) {
        console.error('Error fetching backend data:', error);
      }
    };

    fetchBackendData();
  }, []);

  const combinedData = [...staticData, ...backendData];

  // FIX: Check for name/email existence before toLowerCase
  const filteredData = combinedData.filter(
    (item) =>
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleMoveToClassList = (item) => {
    navigate('/class-list', { state: { user: item } });
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditData(combinedData[index]);
  };

  const handleSaveClick = () => {
    const updatedData = [...combinedData];
    updatedData[editIndex] = editData;
    setBackendData(updatedData.slice(staticData.length));
    setEditIndex(null);
  };

  const handleChange = (field, value) => {
    setEditData((prevData) => ({ ...prevData, [field]: value }));
  };

  return (
    <div className="demo-list-container" style={{ width: '100%' }}>
      <div className="header">
        <h2>Demo List </h2>
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
      <div className="demo-table-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
        <table className="demo-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Phone Number</th>
              <th>Email Address</th>
              <th>Package Code</th>
              <th>Package</th>
              <th>Package Cost</th>
              <th>Amount Paid</th>
              <th>Discount</th>
              <th>Balance Amount</th>
              <th>Class List?</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td>{item.email}</td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={editData.packageCode}
                      onChange={(e) => handleChange('packageCode', e.target.value)}
                    />
                  ) : (
                    item.packageCode
                  )}
                </td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={editData.package}
                      onChange={(e) => handleChange('package', e.target.value)}
                    />
                  ) : (
                    item.package
                  )}
                </td>
                <td>{item.cost}</td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={editData.paid}
                      onChange={(e) => handleChange('paid', e.target.value)}
                    />
                  ) : (
                    item.paid
                  )}
                </td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={editData.discount}
                      onChange={(e) => handleChange('discount', e.target.value)}
                    />
                  ) : (
                    item.discount
                  )}
                </td>
                <td>{item.balance}</td>
                <td>
                  {editIndex === index ? (
                    <span className="icon-btn save-btn" onClick={handleSaveClick}>
                      <FontAwesomeIcon icon={faSave} />
                    </span>
                  ) : (
                    <>
                      <span
                        className="icon-btn edit-btn"
                        onClick={() => handleEditClick(index)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </span>
                      <button
                        className="move-btn"
                        onClick={() => handleMoveToClassList(item)}
                      >
                        Move to Class list
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DemoList1;