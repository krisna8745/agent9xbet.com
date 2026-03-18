import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './sportDetail.css';

const SportRejectedBets = () => {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the match details from navigation state
  const matchCode = location.state?.code || 'N/A';
  const matchName = location.state?.name || 'Unknown Match';

  // Sample data for rejected bets
  const rejectedBetsData = [
    { 
      id: 'BET13456',
      client: 'Client123',
      time: '29-04-2025 07:31:15 PM',
      type: 'Match',
      selection: 'Delhi Capitals',
      odds: '1.98',
      stake: '25,000',
      reason: 'Stake Limit Exceeded'
    },
    { 
      id: 'SBET13789',
      client: 'Client456',
      time: '29-04-2025 07:33:42 PM',
      type: 'Session',
      selection: 'Session 2 - Yes',
      odds: '100',
      stake: '18,500',
      reason: 'Market Suspended'
    },
    { 
      id: 'BET13987',
      client: 'Client789',
      time: '29-04-2025 07:36:28 PM',
      type: 'Match',
      selection: 'Kolkata Knight Riders',
      odds: '2.15',
      stake: '30,000',
      reason: 'Stake Limit Exceeded'
    },
    { 
      id: 'SBET14023',
      client: 'Client321',
      time: '29-04-2025 07:38:55 PM',
      type: 'Session',
      selection: 'Session 1 - No',
      odds: '95',
      stake: '12,000',
      reason: 'Odds Changed'
    },
    { 
      id: 'BET14289',
      client: 'Client654',
      time: '29-04-2025 07:42:10 PM',
      type: 'Match',
      selection: 'Delhi Capitals',
      odds: '1.95',
      stake: '22,000',
      reason: 'Bet Delayed'
    }
  ];

  const handleBackClick = () => {
    navigate('/sportdetail');
  };

  // Calculate total stake
  const totalStake = rejectedBetsData.reduce((sum, item) => {
    return sum + parseInt(item.stake.replace(/,/g, ''));
  }, 0).toLocaleString();

  return (
    <div className="sport-detail-container">
      {/* Header */}
      <div className="sport-detail-header">
        <h1>Rejected Bets</h1>
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>

      {/* Match Info */}
      <div className="match-info">
        <div className="match-code">Code: <span>{matchCode}</span></div>
        <div className="match-name">Name: <span>{matchName}</span></div>
      </div>

      {/* Rejected Bets Table */}
      <div className="table-responsive">
        <table className="sports-table">
          <thead>
            <tr>
              <th>Bet ID</th>
              <th>Client</th>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Selection</th>
              <th>Odds/Rate</th>
              <th>Stake</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {rejectedBetsData.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.client}</td>
                <td>{item.time}</td>
                <td>{item.type}</td>
                <td>{item.selection}</td>
                <td>{item.odds}</td>
                <td className="amount-column">{item.stake}</td>
                <td className="reject-reason">{item.reason}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="6"><strong>Total Stake</strong></td>
              <td className="amount-column"><strong>{totalStake}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SportRejectedBets; 