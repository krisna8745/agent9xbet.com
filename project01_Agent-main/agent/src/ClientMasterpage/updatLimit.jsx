import React, { useState, useRef, useEffect } from 'react';
import { useNavigate,useLocation  } from 'react-router-dom';
import './clientPage.css'; // Reusing existing CSS
import LoadingOverlay from '../components/LoadingOverlay';
import axios from 'axios';
import { useProfile } from '../context/ProfileContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const UpdateLimit = () => {
  const navigate = useNavigate();
  const [chipAmounts, setChipAmounts] = useState({}); // Store chip amounts for each client
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const searchRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const { profile, fetchNameWallet } = useProfile();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const location = useLocation();
  
  const { userId,userData} = location.state || {};
  const parentUser =userData?.originalData?.parentUser;
  console.log(userId,parentUser);


  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const storedAgent = JSON.parse(localStorage.getItem('agent'));
        if (!storedAgent || !storedAgent.AgentNo) {
          console.error('No agent data found in localStorage');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/GetUpdateLimitUser/${storedAgent.id}`);
        console.log('API Response:', response.data);

        if (response.data?.success && Array.isArray(response.data.data)) {
          
          const allData = response.data.data;

          const filteredData = userId
            ? allData.filter(client => String(client._id) === String(userId))
            : allData;
          const formattedClients = filteredData.map((client) => ({
            code: client.userNo || client.AgentNo || 'N/A',
            name: client.email || 'N/A',
            currentChips: client.wallet?.balance || 0,
            _id: client._id
          }));
        
          console.log('Formatted Clients:', formattedClients);
        
          setClients(formattedClients);
          setFilteredClients(formattedClients);
        
          // Initialize chipAmounts
          const initialChipAmounts = {};
          formattedClients.forEach(client => {
            initialChipAmounts[client.code] = '';
          });
          setChipAmounts(initialChipAmounts);
        
        } else {
          console.error('Invalid response format:', response.data);
          setClients([]);
          setFilteredClients([]);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClients([]);
        setFilteredClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Detect window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get current records
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredClients.slice(indexOfFirstRecord, indexOfLastRecord);

  // Total pages
  const totalPages = Math.ceil(filteredClients.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setLoading(false);
    }, 500);
  };

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setLoading(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setLoading(false);
      }, 500);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setLoading(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setLoading(false);
      }, 500);
    }
  };

  // Close search popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredClients]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle input change for a specific client
  const handleChipAmountChange = (clientCode, value) => {
    setChipAmounts(prev => ({
      ...prev,
      [clientCode]: value
    }));
  };

  const updateBalance = async (clientCode, index, type) => {
    const chipValue = chipAmounts[clientCode];
    if (!chipValue || isNaN(Number(chipValue))) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Check if client has sufficient chips for minus operation
    if (type === 'minus' && currentRecords[index].currentChips < Number(chipValue)) {
      toast.error(`Insufficient client chips! Client balance: ₹${currentRecords[index].currentChips}, Required: ₹${chipValue}`);
      return;
    }

    setLoading(true);
    try {
      const client = clients[indexOfFirstRecord + index];
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/agent/updateclientbalance`, {
        clientId: client._id,
        parrentId:parentUser,
        code: client.code,
        name: client.name,
        amount: Number(chipValue),
        type: type,
        AgentNo: profile.AgentNo
      });

      if (response.data.success) {
        toast.success(`Update successful for ${response.data.clientDetails.code} (${response.data.clientDetails.name})`);
        // Clear the input after successful update
        fetchNameWallet();
        setChipAmounts(prev => ({
          ...prev,
          [clientCode]: ''
        }));
   
        setTimeout(() => {
          window.location.reload();
        }, 1000);

      } else {
        toast.error('Failed to update balance');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Agent Low balance');
    } finally {
      setLoading(false);
    }
  };

  const toggleSearch = (column, event) => {
    // Only allow search for code and name
    if (column !== 'code' && column !== 'name') {
      return;
    }

    // Get position for popup
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      setPopupPosition({
        top: rect.bottom,
        left: rect.left
      });
    }

    if (selectedColumn === column && isSearchOpen) {
      setIsSearchOpen(false);
    } else {
      setSelectedColumn(column);
      setIsSearchOpen(true);
    }
    setSearchTerm('');
  };

  const handleSearch = () => {
    if (!selectedColumn || !searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    setLoading(true);
    // Simulate API search delay
    setTimeout(() => {
      const filtered = clients.filter(client =>
        client[selectedColumn] &&
        client[selectedColumn].toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
      setIsSearchOpen(false);
      setLoading(false);
    }, 800);
  };

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setSearchTerm('');
      setFilteredClients(clients);
      setIsSearchOpen(false);
      setLoading(false);
    }, 500);
  };

  // Search icon SVG component
  const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="white" />
    </svg>
  );

  // Custom styles for components not covered by the CSS
  const styles = {
    container: {
      maxWidth: '100%',
      overflowX: 'auto',
      padding: isMobile ? '0' : '0 15px'
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#8ab3a8',
      color: 'white',
      padding: isMobile ? '10px' : '15px 20px',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '10px' : '0'
    },
    headerTitle: {
      margin: isMobile ? '0 0 10px 0' : '0',
      fontSize: isMobile ? '1.5rem' : '2rem'
    },
    tableWrapper: {
      overflowX: 'auto',
      width: '100%'
    },
    chipInput: {
      padding: isMobile ? '6px 8px' : '8px 12px',
      width: '100%',
      maxWidth: '250px',
      boxSizing: 'border-box',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: isMobile ? '0.85rem' : '1rem',
      textAlign: 'center'
    },
    actionButtons: {
      display: 'flex',
      gap: isMobile ? '5px' : '10px',
      flexDirection: isMobile ? 'column' : 'row'
    },
    addButton: {
      backgroundColor: '#ff5252',
      color: 'white',
      border: 'none',
      padding: isMobile ? '4px 10px' : '6px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: isMobile ? '0.85rem' : '1rem'
    },
    minusButton: {
      backgroundColor: '#ff5252',
      color: 'white',
      border: 'none',
      padding: isMobile ? '4px 10px' : '6px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: isMobile ? '0.85rem' : '1rem'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: '20px',
      gap: isMobile ? '5px' : '10px',
      padding: isMobile ? '0 10px 20px 0' : '0 20px 20px 0'
    },
    pageButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: isMobile ? '14px' : '16px',
      padding: isMobile ? '5px' : '8px'
    },
    pageButtonActive: {
      cursor: 'pointer',
      color: '#ff5252',
      fontWeight: 'bold'
    },
    pageButtonDisabled: {
      cursor: 'default',
      color: '#ddd',
    },
    currentPage: {
      border: '1px solid #ddd',
      padding: isMobile ? '3px 7px' : '5px 10px',
      borderRadius: '4px',
      fontSize: isMobile ? '14px' : '16px'
    },
    pageInfo: {
      marginRight: isMobile ? '5px' : '10px',
      fontSize: isMobile ? '12px' : '14px',
      color: '#666',
      marginBottom: isMobile ? '5px' : '0',
      width: isMobile ? '100%' : 'auto',
      textAlign: isMobile ? 'center' : 'right'
    },
    searchPopupStyle: {
      position: 'absolute',
      zIndex: 10,
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      padding: '10px',
      minWidth: isMobile ? '150px' : '200px',
      maxWidth: isMobile ? '280px' : 'auto'
    },
  };

  // Render page numbers for pagination
  const renderPageNumbers = () => {
    // If on mobile, show fewer page numbers
    if (isMobile) {
      let pageNumbers = [];
      if (totalPages <= 5) {
        // If 5 or fewer pages, show all
        pageNumbers = [...Array(totalPages).keys()].map(num => num + 1);
      } else {
        // Show current page, one before and one after (if possible)
        if (currentPage > 1) {
          pageNumbers.push(currentPage - 1);
        }
        pageNumbers.push(currentPage);
        if (currentPage < totalPages) {
          pageNumbers.push(currentPage + 1);
        }

        // Add first page and last page with ellipsis if needed
        if (currentPage > 2) {
          pageNumbers.unshift(1);
          if (currentPage > 3) {
            pageNumbers.splice(1, 0, '...');
          }
        }

        if (currentPage < totalPages - 1) {
          pageNumbers.push(totalPages);
          if (currentPage < totalPages - 2) {
            pageNumbers.splice(pageNumbers.length - 1, 0, '...');
          }
        }
      }

      return pageNumbers.map((number, index) =>
        typeof number === 'string' ? (
          <span key={`ellipsis-${index}`}>...</span>
        ) : (
          <button
            key={number}
            style={{
              ...styles.pageButton,
              ...(currentPage === number ? styles.currentPage : {})
            }}
            onClick={() => paginate(number)}
          >
            {number}
          </button>
        )
      );
    } else {
      // Desktop view: show all page numbers
      return [...Array(totalPages).keys()].map(number => (
        <button
          key={number + 1}
          style={{
            ...styles.pageButton,
            ...(currentPage === number + 1 ? styles.currentPage : {})
          }}
          onClick={() => paginate(number + 1)}
        >
          {number + 1}
        </button>
      ));
    }
  };

  return (
    <div style={styles.container} className="client-page">
      <LoadingOverlay loading={loading} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="header">
        <h1>Client Limit Details</h1>
        <button className="back-btn" onClick={handleBack}>Back</button>
      </div>

      <div style={styles.tableWrapper} className="table-container">
        {isSearchOpen && (
          <div
            className="search-popup"
            style={{
              top: `${popupPosition.top}px`,
              left: isMobile ? '50%' : `${popupPosition.left}px`,
              transform: isMobile ? 'translateX(-50%)' : 'none'
            }}
            ref={searchRef}
          >
            <div className="search-container">
              <input
                type="text"
                placeholder={`Search ${selectedColumn}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                autoFocus
              />
              <div className="search-buttons">
                <button className="search-btn" onClick={handleSearch}>
                  Search
                </button>
                <button className="reset-btn" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        <table className="client-table">
          <thead>
            <tr>
              <th
                className="code"
                onClick={(e) => toggleSearch('code', e)}
                style={{ width: '120px' }}
              >
                Code
                <span className="search-icon"><SearchIcon /></span>
              </th>
              <th
                className="name"
                onClick={(e) => toggleSearch('name', e)}
                style={{ width: '150px' }}
              >
                Name
                <span className="search-icon"><SearchIcon /></span>
              </th>
              <th style={{ width: '120px' }}>C. Chips</th>
              <th style={{ width: '250px' }}>Add / Minus Limit</th>
              <th style={{ width: '200px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((client, index) => (
              <tr key={client.code}>
                <td>{client.code}</td>
                <td>{client.name}</td>
                <td>{client.currentChips}</td>
                <td>
                  <input
                    type="text"
                    placeholder="Enter Chips"
                    value={chipAmounts[client.code] || ''}
                    onChange={(e) => handleChipAmountChange(client.code, e.target.value)}
                    style={styles.chipInput}
                  />
                </td>
                <td>
                  <div style={styles.actionButtons}>
                    <button
                      style={styles.addButton}
                      onClick={() => updateBalance(client.code, index, 'add')}
                    >
                      Add
                    </button>
                    {/* <button 
                      style={styles.minusButton} 
                      onClick={() => updateBalance(client.code, index, 'minus')}
                    >
                      Minus
                    </button> */}
                    <button
                      style={styles.minusButton}
                      onClick={() => updateBalance(client.code, index, 'minus')}
                    >
                      Minus
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.pagination}>
        <div style={styles.pageInfo}>
          Page {currentPage} of {totalPages} ({filteredClients.length} records)
        </div>
        <button
          style={{
            ...styles.pageButton,
            ...(currentPage === 1 ? styles.pageButtonDisabled : styles.pageButtonActive)
          }}
          onClick={prevPage}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {renderPageNumbers()}
        <button
          style={{
            ...styles.pageButton,
            ...(currentPage === totalPages ? styles.pageButtonDisabled : styles.pageButtonActive)
          }}
          onClick={nextPage}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default UpdateLimit;
