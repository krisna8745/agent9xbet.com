import React, { useState, useEffect, useRef } from 'react';
import './clientPage.css';
import { useNavigate } from "react-router-dom";
import LoadingOverlay from '../components/LoadingOverlay';
import axios from 'axios';
import { useProfile } from '../context/ProfileContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const ClientPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { profile} = useProfile();  

  const [sampleClients, setSampleClients] = useState([]);

  // Extract fetch function to be reusable
  const fetchClients = async () => {
    setLoading(true);
    try {
      const storedAgent = JSON.parse(localStorage.getItem('agent'));
      if (!storedAgent || !storedAgent.AgentNo) {
        console.error('No agent data found in localStorage');
        setLoading(false);
        return;
      }
      console.log('API Response:', storedAgent.id);
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/client/getAllUserclient/${storedAgent.id}`);
      console.log('API Response:', storedAgent.id);

      if (response.data && Array.isArray(response.data)) {
        const formattedClients = response.data.map((client, index) => ({
          id: client._id || index + 1,
          _id: client._id,
          code: client.userNo || client.AgentNo || 'N/A',
          name: client.email ||  'N/A',
          phoneNumber: client.phoneNumber || client.contact || client.username || '',
          agent: client.agent || storedAgent.AgentNo,
          contact: client.username || client.contact || 'N/A',
          doj: client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-GB') : 'N/A',
          pwd: client.pwd,
          exposure: `${(client.wallet?.exposureBalance || 0) + (client.wallet?.sessionexposure || 0)}`,
          type: client.commType || 'N/A',
          mat: client.matchComm || 'N/A',
          ses: client.sessComm || 'N/A',
          chips: `${client.wallet?.balance || 0}`,
          status: 'Active',
          originalData: client,
          isActive: client.isActive
        }));

        console.log('Formatted Clients:', formattedClients);
        setSampleClients(formattedClients);
        setClients(formattedClients);
        setFilteredClients(formattedClients);
      } else {
        console.error('Invalid response format:', response.data);
        setSampleClients([]);
        setClients([]);
        setFilteredClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setSampleClients([]);
      setClients([]);
      setFilteredClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

console.log(sampleClients);
  
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedClient, setSelectedClient] = useState(null);
  const dropdownRefs = useRef({});
  
  // Bets modal state
  const [showBetsModal, setShowBetsModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(false);
  const betsModalRef = useRef(null);
  // Close search popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
         // Close dropdown if clicking outside
         if (!Object.values(dropdownRefs.current).some(ref => ref && ref.contains(event.target)) &&
         !event.target.closest('.dropdown-menu')) {
       setOpenDropdownId(null);
       setSelectedClient(null);
     }
     // Close bets modal if clicking outside
     if (betsModalRef.current && !betsModalRef.current.contains(event.target) &&
         !event.target.closest('.eye-btn')) {
       setShowBetsModal(false);
       setSelectedUserId(null);
       setUserBets([]);
     }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const toggleSearch = (column, event) => {
    // Only allow search for code, name, and contact
    if (column !== 'code' && column !== 'name' && column !== 'contact') {
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
      <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="white"/>
    </svg>
  );

  const handleCreateClick = () => {
    navigate("/create_subuser", {
        state: {
          role: "client",
          prvrole:"agent"
        }
      });
  };
  
  
  const handleBack = () => {
    navigate("/"); 
  };
  
  const handleUpdateLimit = () => {
    navigate("/updatLimit"); 
  };
  
  const toggleDropdown = (clientId, client, event) => {
    event.stopPropagation();
    if (openDropdownId === clientId) {
      setOpenDropdownId(null);
      setSelectedClient(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom -30,
        left: rect.left+20
      });
      setSelectedClient(client);
      setOpenDropdownId(clientId);
    }
  };

  const handleStatement = () => {
    if (!selectedClient) return;
    navigate("/accountStatement", {
      state: { userId: selectedClient._id, userData: selectedClient }
    });
    setOpenDropdownId(null);
    setSelectedClient(null);
  };

  const handleResetPassword = () => {
    if (!selectedClient) return;
    navigate("/change-password", {
      state: { userId: selectedClient._id, userData: selectedClient }
    });
    setOpenDropdownId(null);
    setSelectedClient(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedClient) return;
    
    // Toggle status: if inactive, make active; if active, make inactive
    const newStatus = !selectedClient.isActive;
    
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/users/isactive/${selectedClient._id}`,
        {
          isActive: newStatus,
          role: "client"
        }
      );
      // Show success toast
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      
      // Refetch users immediately after status update
      await fetchClients();
  
    } catch (error) {
      console.error("Failed to update user status", error);
      toast.error('Failed to update user status');
    }
    
    setOpenDropdownId(null);
    setSelectedClient(null);
  };

  // Fetch user bets
  const fetchUserBets = async (userId) => {
    if (!userId) return;
    
    setLoadingBets(true);
    setSelectedUserId(userId);
    setShowBetsModal(true);
    setUserBets([]);
    
    try {
      // Fetch bets from multiple endpoints
      const [betsResponse, bets2Response, lagaiKhaiResponse, cricketResponse] = await Promise.allSettled([
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/bets/${userId}`),
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/bets2/${userId}`),
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/laggai_khai_getuserbet/${userId}`),
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/cricket-market2/${userId}`)
      ]);

      let allBets = [];

      // Process bets from /api/bets/:userId (Bid model)
      if (betsResponse.status === 'fulfilled' && betsResponse.value.data) {
        const data = betsResponse.value.data;
        if (data.success && data.bets && Array.isArray(data.bets)) {
          allBets = [...allBets, ...data.bets
            .filter(bet => bet.result === "Pending")
            .map(bet => ({
              ...bet,
              source: 'bids'
            }))];
        }
      }

      // Process bets from /api/bets2/:userId (Bet model)
      if (bets2Response.status === 'fulfilled' && bets2Response.value.data) {
        const data = bets2Response.value.data;
        if (data.success && data.bets && Array.isArray(data.bets)) {
          allBets = [...allBets, ...data.bets
            .filter(bet => bet.result === "Pending")
            .map(bet => ({
              ...bet,
              source: 'bets'
            }))];
        }
      }

      // Process lagai khai bets
      if (lagaiKhaiResponse.status === 'fulfilled' && lagaiKhaiResponse.value.data) {
        const data = lagaiKhaiResponse.value.data;
        if (data.success && data.bets && Array.isArray(data.bets)) {
          allBets = [...allBets, ...data.bets
            .filter(bet => bet.result === "Pending")
            .map(bet => ({
              match: bet.match,
              label: bet.label,
              type: bet.type,
              stake: bet.stake,
              odds: bet.odds,
              result: bet.result,
              createdAt: bet.createdAt,
              source: 'lagaiKhai'
            }))];
        }
      }

      // Process cricket market bets
      if (cricketResponse.status === 'fulfilled' && cricketResponse.value.data) {
        const data = cricketResponse.value.data;
        if (Array.isArray(data)) {
          allBets = [...allBets, ...data
            .filter(bet => bet.result === "Pending")
            .map(bet => ({
              matchName: bet.matchName,
              matbet: bet.matbet,
              mode: bet.mode,
              stake: bet.stake,
              odds: bet.noRuns || bet.yesRuns,
              result: bet.result,
              createdAt: bet.createdAt,
              source: 'cricket'
            }))];
        }
      }

      // Sort by date (newest first)
      allBets.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      if (allBets.length === 0) {
        toast.info('No bets found for this user');
      } else {
        setUserBets(allBets);
      }
    } catch (error) {
      console.error('Error fetching user bets:', error);
      toast.error('Failed to fetch user bets');
      setUserBets([]);
    } finally {
      setLoadingBets(false);
    }
  };

  // Handle eye button click
  const handleEyeClick = (e, userId) => {
    e.stopPropagation(); // Prevent triggering row click or dropdown
    fetchUserBets(userId);
  };

  const handleLimitUpdate = () => {
    if (!selectedClient) return;
    navigate("/updatLimit", {
      state: { userId: selectedClient._id, userData: selectedClient }
    });
    setOpenDropdownId(null);
    setSelectedClient(null);
  };

  // const handleSendWhatsApp = () => {
  //   if (!selectedClient) return;
  //   const client = selectedClient;
  //   const phoneNumber = client.phoneNumber || client.contact || client.originalData?.phoneNumber || client.originalData?.contact || '';
    
  //   if (!phoneNumber || phoneNumber === 'N/A') {
  //     alert('Phone number not available for this user');
  //     setOpenDropdownId(null);
  //     return;
  //   }
    
  //   // Remove any non-digit characters except +
  //   const cleanPhone = phoneNumber.toString().replace(/[^\d+]/g, '');
    
  //   if (!cleanPhone || cleanPhone.length < 10) {
  //     alert('Invalid phone number');
  //     setOpenDropdownId(null);
  //     return;
  //   }
    
  //   // If phone doesn't start with country code, add 91 (India)
  //   let finalPhone = cleanPhone;
  //   if (cleanPhone.startsWith('+')) {
  //     finalPhone = cleanPhone.substring(1);
  //   } else if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
  //     finalPhone = `91${cleanPhone}`;
  //   }
    
  //   const message = `Client Details:
  //                  link:yox9.com/login
  //                  Code: ${client.code}
  //                  Password:${client.pwd}`;

  //   const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  //   window.open(whatsappUrl, '_blank');
  //   setOpenDropdownId(null);
  //   setSelectedClient(null);
  // };

const handleSendWhatsApp = () => {
  if (!selectedClient) return;

  const client = selectedClient;

  const message = `Client Details:
Code: ${client.code}
Password: ${client.pwd}
link : yox9.com
`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');

  setOpenDropdownId(null);
  setSelectedClient(null);
};
  return (
    <div className="client-page" style={{ padding: '0px' }}>
      <LoadingOverlay loading={loading} />
      <div className="header">
        <h1>Client Details</h1> 
        <button className="back-btn" onClick={handleBack}>Back</button>
      </div>
      
      <div className="actions">
        <button className="create-btn" onClick={handleCreateClick}>+ Create</button>
        {/* <button className="update-btn" onClick={handleUpdateLimit}>Update Limit</button> */}
      </div>
      
      <div className="table-container">
        {isSearchOpen && (
          <div 
            className="search-popup" 
            style={{ 
              top: `${popupPosition.top}px`, 
              left: `${popupPosition.left}px` 
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
              <th className="action-col">#</th>
              {/* <th className="num">#</th> */}
              <th className="code" onClick={(e) => toggleSearch('code', e)}>
                Code
                <span className="search-icon"><SearchIcon /></span>
              </th>
              <th className="name" onClick={(e) => toggleSearch('name', e)}>
                Name
                <span className="search-icon"><SearchIcon /></span>
              </th>
              <th className="agent">Agent</th>
              <th className="contact" onClick={(e) => toggleSearch('contact', e)}>
                Contact
                <span className="search-icon"><SearchIcon /></span>
              </th>
              <th className="doj">D.O.J.</th>
              <th className="pwd">PWD</th>
              <th className="exposure">Exposure</th>
              <th className="client-comm" colSpan="3">
                Client Comm %
                <div className="sub-headers">
                  <span className="type">Type</span>
                  <span className="mat">Mat</span>
                  <span className="ses">Ses</span>
                </div>
              </th>
              <th className="chips">C.Chips</th>
              <th className="status">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Display data or no data state */}
            {filteredClients.length > 0 ? (
              filteredClients.map((client, index) => (
                <tr key={client.id}>
                  <td className="action-cell">
                    <div className="dropdown-wrapper" ref={el => dropdownRefs.current[client.id] = el}>
                      <button 
                        className="dropdown-btn"
                        onClick={(e) => toggleDropdown(client.id, client, e)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="white"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                  {/* <td>{index + 1}</td> */}
                  <td>{client.code}</td>
                  <td>{client.name}</td>
                  <td>{client.agent}</td>
                  <td>{client.contact}</td>
                  <td>{client.doj}</td>
                  <td>{client.pwd}</td>
                  <td style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span>{client.exposure}</span>
                    {(() => {
                      // Extract numeric value from exposure (remove any non-numeric characters except decimal point)
                      const exposureValue = parseFloat(client.exposure.toString().replace(/[^\d.-]/g, '')) || 0;
                      if (exposureValue > 0) {
                        return (
                          <button
                            className="eye-btn"
                            onClick={(e) => handleEyeClick(e, client._id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="View Bets"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#6e9b8a"/>
                            </svg>
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </td>
                  <td>{client.type}</td>
                  <td>{client.mat}</td>
                  <td>{client.ses}</td>
                  <td>{client.chips}</td>
                  <td>{client.isActive ? 'Active' : 'Inactive'}</td>
                </tr>
              ))
            ) : (
              <tr className="no-data">
                <td colSpan="14">
                  <div className="empty-state">
                    <div className="icon">
                      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 3H6C4.34 3 3 4.34 3 6V18C3 19.66 4.34 21 6 21H18C19.66 21 21 19.66 21 18V6C21 4.34 19.66 3 18 3ZM6 5H18C18.55 5 19 5.45 19 6V14H5V6C5 5.45 5.45 5 6 5ZM18 19H6C5.45 19 5 18.55 5 18V16H19V18C19 18.55 18.55 19 18 19Z" fill="#CCCCCC"/>
                      </svg>
                    </div>
                    <p>No Data</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Dropdown Modal - Rendered outside table */}
      {openDropdownId && selectedClient && (
        <div 
          className="dropdown-menu"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <button className="dropdown-item" onClick={handleStatement}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM16 10H8V8H16V10ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
            </svg>
            Statement
          </button>
          <button className="dropdown-item" onClick={handleResetPassword}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 3C13.66 3 15 4.34 15 6V8H9V6C9 4.34 10.34 3 12 3ZM18 20H6V10H18V20ZM12 12C10.9 12 10 12.9 10 14C10 15.1 10.9 16 12 16C13.1 16 14 15.1 14 14C14 12.9 13.1 12 12 12Z" fill="currentColor"/>
            </svg>
            Reset Password
          </button>
          <button className="dropdown-item" onClick={handleToggleStatus}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {selectedClient.isActive ? (
                <>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M8 8L16 16M16 8L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
            {selectedClient.isActive ? 'Inactive' : 'Active'}
          </button>
          <button className="dropdown-item" onClick={handleLimitUpdate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 6L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Limit Update
          </button>
          <button className="dropdown-item" onClick={handleSendWhatsApp}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382C17.342 14.208 15.11 12.894 14.785 12.756C14.46 12.618 14.22 12.548 13.98 12.678C13.74 12.808 12.769 13.41 12.529 13.578C12.289 13.746 11.823 13.886 11.348 13.716C10.873 13.546 9.712 13.156 8.281 11.725C7.15 10.594 6.56 9.303 6.39 8.828C6.22 8.353 6.36 7.887 6.528 7.647C6.696 7.407 6.826 7.167 6.956 6.937C7.086 6.707 7.016 6.517 6.916 6.357C6.816 6.197 6.176 4.965 5.936 4.485C5.696 4.005 5.456 4.075 5.256 4.055C5.056 4.035 4.826 4.035 4.596 4.035C4.366 4.035 4.076 4.105 3.816 4.305C3.556 4.505 2.984 4.965 2.984 6.027C2.984 7.089 3.816 8.111 3.936 8.281C4.056 8.451 5.456 10.594 7.5 12.068C9.884 13.752 11.728 14.382 12.289 14.552C12.85 14.722 13.28 14.652 13.67 14.532C14.06 14.412 15.46 13.89 15.75 13.33C16.04 12.77 16.04 12.28 15.94 12.118C15.84 11.956 15.74 11.956 15.47 11.826C15.2 11.696 13.74 11.246 13.35 11.126C12.96 11.006 12.68 10.946 12.4 11.216C12.12 11.486 11.3 12.208 11.11 12.418C10.92 12.628 10.73 12.648 10.46 12.518C10.19 12.388 9.182 12.118 7.99 11.048C7.01 10.168 6.3 9.088 6.11 8.818C5.92 8.548 6.1 8.438 6.3 8.238C6.49 8.048 6.68 7.798 6.87 7.598C7.06 7.398 7.25 7.238 7.4 7.408C7.55 7.578 7.9 8.018 8.05 8.208C8.2 8.398 8.35 8.568 8.5 8.768C8.65 8.968 8.8 9.128 8.95 9.298C9.1 9.468 9.25 9.648 9.05 9.888C8.85 10.128 8.4 10.598 7.99 10.978C7.58 11.358 7.2 11.678 6.91 11.888C6.62 12.098 6.38 12.248 6.64 12.578C6.9 12.908 7.5 13.548 8.05 14.088C8.6 14.628 9.1 15.088 9.35 15.358C9.6 15.628 9.85 15.888 10.15 15.888C10.45 15.888 10.6 15.748 10.8 15.548C11 15.348 11.4 14.888 11.6 14.628C11.8 14.368 12 14.208 12.2 14.368C12.4 14.528 13.3 15.248 13.5 15.418C13.7 15.588 13.9 15.748 14.1 15.678C14.3 15.608 15.46 14.982 15.75 14.292C15.84 14.102 15.94 13.902 15.84 13.712C15.74 13.522 15.64 13.462 15.47 13.332L17.472 14.382Z" fill="#25D366"/>
            </svg>
            Send On WhatsApp
          </button>
        </div>
      )}
      
      {/* Bets Modal */}
      {showBetsModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '9px'
          }}
          onClick={() => {
            setShowBetsModal(false);
            setSelectedUserId(null);
            setUserBets([]);
          }}
        >
          <div
            ref={betsModalRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '8px',
              maxWidth: '95%',
              maxHeight: '90vh',
              width: '1000px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              '@media (max-width: 768px)': {
                width: '100%',
                maxWidth: '100%',
                maxHeight: '95vh',
                borderRadius: '0'
              }
            }}
            className="bets-modal"
          >
            {/* Modal Header */}
            <div style={{
              background: '#8ab7a6',
              color: '#fff',
              padding: '15px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>User Bets</h3>
              <button
                onClick={() => {
                  setShowBetsModal(false);
                  setSelectedUserId(null);
                  setUserBets([]);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Modal Content */}
            <div style={{
              padding: '7px',
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 80px)'
            }}>
              {loadingBets ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  Loading bets...
                </div>
              ) : userBets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No bets found for this user
                </div>
              ) : (
                <div style={{ 
                  overflowX: 'auto',
                  overflowY: 'visible',
                  width: '100%',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '600px'
                  }}>
                    <thead>
                      <tr style={{ background: '#8ab7a6', color: '#fff' }}>
                        <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #b2c8b2' }}>Match</th>
                        <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #b2c8b2' }}>Bet</th>
                        <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #b2c8b2' }}>Type</th>
                        <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #b2c8b2' }}>Stake</th>
                        <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #b2c8b2' }}>Odds</th>
                        <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #b2c8b2' }}>Result</th>
                        <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #b2c8b2' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userBets.map((bet, index) => {
                        const matchName = bet.matchName || bet.match || '-';
                        const betLabel = bet.matbet || bet.label || '-';
                        const betType = bet.mode || bet.type || '-';
                        const stake = bet.stake || '-';
                        const odds = bet.noRuns || bet.yesRuns || bet.odds || '-';
                        const result = bet.result || '-';
                        const bgColor = result === 'win' ? '#d4edda' : result === 'loss' ? '#f8d7da' : 'transparent';
                        
                        return (
                          <tr key={bet._id || index} style={{
                            background: index % 2 === 0 ? '#f8f9fa' : '#fff'
                          }}>
                            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', background: bgColor }}>{matchName}</td>
                            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', background: bgColor }}>{betLabel}</td>
                            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', background: bgColor }}>{betType}</td>
                            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', background: bgColor }}>{stake}</td>
                            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', background: bgColor }}>{odds}</td>
                            <td style={{
                              padding: '8px',
                              textAlign: 'center',
                              border: '1px solid #ddd',
                              color: result === 'win' ? 'green' : result === 'loss' ? 'red' : '#666',
                              fontWeight: result === 'win' || result === 'loss' ? 'bold' : 'normal',
                              background: bgColor
                            }}>{result}</td>
                            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', background: bgColor }}>
                              {bet.createdAt ? new Date(bet.createdAt).toLocaleString() : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ClientPage;
