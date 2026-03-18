import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './sportDetail.css';

const SportAgentCommission = () => {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the match details from navigation state
  const matchCode = location.state?.code || 'N/A';
  const matchName = location.state?.name || 'Unknown Match';

  // Sample data for agent commission report
  const commissionData = [
    { agent: 'Agent001', client: 'Client123', amount: '25,000', commission: '1,250', rate: '5%', type: 'Match' },
    { agent: 'Agent002', client: 'Client456', amount: '18,500', commission: '925', rate: '5%', type: 'Session' },
    { agent: 'Agent001', client: 'Client789', amount: '30,000', commission: '1,500', rate: '5%', type: 'Match' },
    { agent: 'Agent003', client: 'Client321', amount: '12,000', commission: '600', rate: '5%', type: 'Session' },
    { agent: 'Agent002', client: 'Client654', amount: '22,000', commission: '1,100', rate: '5%', type: 'Match' },
  ];

  const handleBackClick = () => {
    navigate('/sportdetail');
  };

  // Calculate totals
  const totalAmount = commissionData.reduce((sum, item) => {
    return sum + parseInt(item.amount.replace(/,/g, ''));
  }, 0).toLocaleString();

  const totalCommission = commissionData.reduce((sum, item) => {
    return sum + parseInt(item.commission.replace(/,/g, ''));
  }, 0).toLocaleString();

  return (
    <div className="sport-detail-container">
      {/* Header */}
      <div className="sport-detail-header">
        <h1>Agent Commission Report</h1>
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>

      {/* Match Info */}
      <div className="match-info">
        <div className="match-code">Code: <span>{matchCode}</span></div>
        <div className="match-name">Name: <span>{matchName}</span></div>
      </div>

      {/* Commission Table */}
      <div className="table-responsive">
        <table className="sports-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Commission</th>
              <th>Rate</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {commissionData.map((item, index) => (
              <tr key={index}>
                <td>{item.agent}</td>
                <td>{item.client}</td>
                <td className="amount-column">{item.amount}</td>
                <td className="amount-column">{item.commission}</td>
                <td>{item.rate}</td>
                <td>{item.type}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="2"><strong>Total</strong></td>
              <td className="amount-column"><strong>{totalAmount}</strong></td>
              <td className="amount-column"><strong>{totalCommission}</strong></td>
              <td colSpan="2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SportAgentCommission; 