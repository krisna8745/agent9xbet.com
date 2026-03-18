import React, { useEffect, useState } from 'react';
import './clientlenden.css';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import axios from 'axios';
const ClientLenden = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { profile } = useProfile();

  const parentId = profile?.userId;

  useEffect(() => {
    const fetchBets = async () => {
      if (!parentId) return;
      
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getMatchandSessionCommLenden/${parentId}`);
        console.log(res.data);
        
        if (res.data && res.data.combinedCommission) {
          setCombinedData(res.data.combinedCommission);
        }
      } catch (error) {
        console.error('Error fetching bets:', error);
        setCombinedData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [parentId]);

  // Get all users for a selected match (both matchUsers and sessionUsers)
  // Combine duplicate users and sum their commissions
  const getAllUsersForMatch = (matchData) => {
    if (!matchData) return [];
    
    // Use a Map to track unique users by userId or username
    const userMap = new Map();
    
    // Process match users
    if (matchData.matchUsers && matchData.matchUsers.length > 0) {
      matchData.matchUsers.forEach(user => {
        const userId = user.userId || user._id;
        const username = user.username || 'N/A';
        const key = userId || username;
        
        if (userMap.has(key)) {
          // User already exists, add to match commission
          const existing = userMap.get(key);
          existing.mComm += (user.commission || 0);
          existing.tComm = existing.mComm + existing.sComm;
        } else {
          // New user entry
          userMap.set(key, {
            userId: userId,
            username: username,
            mComm: user.commission || 0,
            sComm: 0,
            tComm: user.commission || 0
          });
        }
      });
    }
    
    // Process session users
    if (matchData.sessionUsers && matchData.sessionUsers.length > 0) {
      matchData.sessionUsers.forEach(user => {
        const userId = user.userId || user._id;
        const username = user.username || 'N/A';
        const key = userId || username;
        
        if (userMap.has(key)) {
          // User already exists, add to session commission
          const existing = userMap.get(key);
          existing.sComm += (user.commission || 0);
          existing.tComm = existing.mComm + existing.sComm;
        } else {
          // New user entry
          userMap.set(key, {
            userId: userId,
            username: username,
            mComm: 0,
            sComm: user.commission || 0,
            tComm: user.commission || 0
          });
        }
      });
    }
    
    // Convert Map to array
    return Array.from(userMap.values());
  };

  // Calculate totals for each column
  const calculateTotals = () => {
    if (!combinedData || combinedData.length === 0) {
      return {
        name: 'Total',
        matchCommission: 0,
        sessionCommission: 0,
        totalCommission: 0
      };
    }

    return {
      name: 'Total',
      matchCommission: combinedData.reduce((sum, row) => sum + (row.matchCommission || 0), 0),
      sessionCommission: combinedData.reduce((sum, row) => sum + (row.sessionCommission || 0), 0),
      totalCommission: combinedData.reduce((sum, row) => sum + (row.totalCommission || 0), 0)
    };
  };

  const totals = calculateTotals();

  const handleRowClick = (row) => {
    setSelectedMatch(row);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMatch(null);
  };

  const allUsers = selectedMatch ? getAllUsersForMatch(selectedMatch) : [];

  return (
    <div className="client-lenden-container">
      <div className="header">
        <div className="title">Commission Lenden</div>
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table className="commission-table">
            <thead>
              <tr>
                <th rowSpan="2" className="name-header">Match Name</th>
                <th colSpan="3" className="mila-header">Commison</th>
              </tr>
              <tr className="sub-header-row">
                <th className="sub-header">M.Comm</th>
                <th className="sub-header">S.Comm</th>
                <th className="sub-header">T.Comm</th>
              </tr>
            </thead>
            <tbody>
              {combinedData.length > 0 ? (
                <>
                  {combinedData.map((row, index) => (
                    <tr key={index} className="clickable-row" onClick={() => handleRowClick(row)}>
                      <td className="match-name-cell">{row.match || 'Unknown Match'}</td>
                      <td className="mila-val commission-cell">{(row.matchCommission || 0).toFixed(2)}</td>
                      <td className="mila-val commission-cell">{(row.sessionCommission || 0).toFixed(2)}</td>
                      <td className="mila-val commission-cell">{(row.totalCommission || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td className="match-name-cell">{totals.name}</td>
                    <td className="mila-val commission-cell">{totals.matchCommission.toFixed(2)}</td>
                    <td className="mila-val commission-cell">{totals.sessionCommission.toFixed(2)}</td>
                    <td className="mila-val commission-cell">{totals.totalCommission.toFixed(2)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedMatch && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Match Details - {selectedMatch.match || 'Unknown Match'}</h2>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-table-container">
                {allUsers.length > 0 ? (
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Client Id</th>
                        <th>M.Comm</th>
                        <th>S.Comm</th>
                        <th>T.Comm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user, index) => (
                        <tr key={index}>
                          <td>{user.username || user.userId || 'N/A'}</td>
                          <td className="mila-val">{user.mComm.toFixed(2)}</td>
                          <td className="mila-val">{user.sComm.toFixed(2)}</td>
                          <td className="mila-val">{user.tComm.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center' }}>No users found for this match</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientLenden;
