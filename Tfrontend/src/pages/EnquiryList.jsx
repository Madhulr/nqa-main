import './EnquiryList.css';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';

const EnquiryList = ({ isSidebarOpen }) => {
  const [showBatchMove, setShowBatchMove] = useState(false);
  const [batchSubject, setBatchSubject] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [enquiries, setEnquiries] = useState([
    { id: 1, fullName: 'John Doe', phone: '123-456-7890', email: 'john@example.com', location: 'New York', module: 'Math', trainingMode: 'Online', trainingTimings: 'Morning', startTime: '9:00 AM', calling1: 'Yes', calling2: 'No', calling3: 'Yes', calling4: 'No', calling5: 'Yes', previousInteraction: 'Email' },
    { id: 2, fullName: 'Jane Smith', phone: '987-654-3210', email: 'jane@example.com', location: 'Los Angeles', module: 'Science', trainingMode: 'Offline', trainingTimings: 'Afternoon', startTime: '2:00 PM', calling1: 'No', calling2: 'Yes', calling3: 'No', calling4: 'Yes', calling5: 'No', previousInteraction: 'Call' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState('single');
  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleMoveToDemoList = (ids) => {
    const selectedEnquiries = enquiries.filter((e) => ids.includes(e.id));
    setSelectedEnquiry(selectedEnquiries);
    setShowBatchMove(true);
  };

  const handleEditClick = (id) => {
    setEditRowId(id);
    const enquiry = enquiries.find((e) => e.id === id);
    setEditData(enquiry);
  };

  const handleSaveClick = () => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === editRowId ? { ...e, ...editData } : e))
    );
    setEditRowId(null);
  };

  const handleBatchMoveSubmit = (e) => {
    e.preventDefault();
    if (selectedEnquiry) {
      setEnquiries((prev) => prev.filter((e) => !selectedEnquiry.map(se => se.id).includes(e.id)));
    }
    setBatchSubject("");
    setBatchCode("");
    setShowBatchMove(false);
  };

  const filtered = enquiries.filter((e) =>
    e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { field: 'fullName', headerName: 'Full Name', width: 180, editable: true },
    { field: 'phone', headerName: 'Phone Number', width: 180, editable: true },
    { field: 'email', headerName: 'Email Address', width: 250, editable: true },
    { field: 'location', headerName: 'Current Location', width: 180, editable: true },
    { field: 'module', headerName: 'Subject / Module', width: 180, editable: true },
    { field: 'trainingMode', headerName: 'Training Mode', width: 150, editable: true },
    { field: 'trainingTimings', headerName: 'Training Timings', width: 180, editable: true },
    { field: 'startTime', headerName: 'Start Time', width: 150, editable: true },
    { field: 'calling1', headerName: 'Calling 1', width: 150, editable: true },
    { field: 'calling2', headerName: 'Calling 2', width: 150, editable: true },
    { field: 'calling3', headerName: 'Calling 3', width: 150, editable: true },
    { field: 'calling4', headerName: 'Calling 4', width: 150, editable: true },
    { field: 'calling5', headerName: 'Calling 5', width: 150, editable: true },
    { field: 'previousInteraction', headerName: 'Previous Interaction', width: 220, editable: true },
    {
      field: 'action',
      headerName: 'Action',
      width: 200,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '5px' }}>
          {editRowId === params.row.id ? (
            <button style={{ width: '60px' }} onClick={handleSaveClick}>Save</button>
          ) : (
            <>
              <button style={{ width: '60px' }} onClick={() => handleEditClick(params.row.id)}>Edit</button>
              <button style={{ width: '80px' }} className="move-btn" onClick={() => handleMoveToDemoList([params.row.id])}>Move</button>
            </>
          )}
        </div>
      ),
      sortable: false,
      filterable: false,
      headerClassName: 'table-header',
    },
  ];

  return (
    <div className={`enquiry-list-page ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      <div className="toolbar">
        <div className="title">Enquiry List</div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mode-buttons">
          <button
            className={mode === 'single' ? 'active' : ''}
            onClick={() => {
              setMode('single');
              if (selectedRows.length > 0) {
                handleMoveToDemoList(selectedRows);
              }
            }}
          >
            Move .....
          </button>
        </div>
      </div>

      <div className="table-container">
        <Box sx={{ height: 580, width: '100%' }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
            onSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection);
            }}
            onCellEditCommit={(params) => {
              if (editRowId === params.id) {
                setEditData((prev) => ({ ...prev, [params.field]: params.value }));
              }
            }}
          />
        </Box>
      </div>

      {showBatchMove && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Batch Move</h2>
            <p>
              Enter the below details to move the students to the demo list, <br />
              make sure you selected students are of the same batch and <br />
              subject before you batch move.
            </p>
            <form onSubmit={handleBatchMoveSubmit}>
              <div>
                <label htmlFor="batch-subject">Batch Subject</label>
                <input
                  id="batch-subject"
                  type="text"
                  placeholder="Enter Batch Subject"
                  value={batchSubject}
                  onChange={(e) => setBatchSubject(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="batch-code">Package Batch Code</label>
                <input
                  id="batch-code"
                  type="text"
                  placeholder="Enter Batch Code"
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                />
              </div>
              <div>
              <button type="button" className="cancel-btn" onClick={() => setShowBatchMove(false)}>Cancel</button>
              <button type="submit">Batch Move</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryList;