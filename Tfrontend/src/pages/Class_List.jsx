import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DemoList.css';
import { IoSearch } from "react-icons/io5";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';

const Class_List = () => {
  const navigate = useNavigate();
  const staticData = [
    {
      name: 'Rohan Iyer',
      phone: '+91 56785 43210',
      email: 'rohan.iyer@example.com',
      packageCode: 'MRS005',
      package: 'MERN Stack',
      placement: 'Yes',
      dataLink: 'https://example.com/data1',
      dataUpdated: '2024-05-01',
    },
    {
      name: 'Meera Nambiar',
      phone: '+91 51234 56789',
      email: 'meera.n@example.com',
      packageCode: 'DA0005',
      package: 'Data Analytics',
      placement: 'No',
      dataLink: 'https://example.com/data2',
      dataUpdated: '2024-05-10',
    },
  ];

  const [backendData, setBackendData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const response = await axios.get('/api/class-data');
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

  const handleMoveToPlacementList = (item) => {
    navigate('/placement-list', { state: { user: item } });
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
        <h2>Class List</h2>
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
              <th>Placement</th>
              <th>Data Link</th>
              <th>Data Updated</th>
              <th>Placement List</th>
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
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={editData.placement}
                      onChange={(e) => handleChange('placement', e.target.value)}
                    />
                  ) : (
                    item.placement
                  )}
                </td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={editData.dataLink}
                      onChange={(e) => handleChange('dataLink', e.target.value)}
                    />
                  ) : (
                    <a href={item.dataLink} target="_blank" rel="noopener noreferrer">
                      {item.dataLink}
                    </a>
                  )}
                </td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={editData.dataUpdated}
                      onChange={(e) => handleChange('dataUpdated', e.target.value)}
                    />
                  ) : (
                    item.dataUpdated
                  )}
                </td>
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
                        onClick={() => handleMoveToPlacementList(item)}
                      >
                        Move to Placement List
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

export default Class_List;