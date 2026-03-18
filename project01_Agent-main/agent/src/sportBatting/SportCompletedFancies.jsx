import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './sportDetail.css';

const SportCompletedFancies = () => {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the match details from navigation state
  const matchCode = location.state?.code || 'N/A';
  const matchName = location.state?.name || 'Unknown Match';

  // Sample data for completed fancies
  const completedFanciesData = [
    { 
      id: 'FANCY001',
      name: 'Total Runs (First 6 Overs)',
      result: '48',
      declareTime: '29-04-2025 08:15 PM',
      plus: '12,500',
      minus: '-',
      net: '+12,500'
    },
    { 
      id: 'FANCY002',
      name: 'Player of the Match',
      result: 'R. Sharma',
      declareTime: '29-04-2025 11:30 PM',
      plus: '8,200',
      minus: '-',
      net: '+8,200'
    },
    { 
      id: 'FANCY003',
      name: 'Total Wickets (First 10 Overs)',
      result: '3',
      declareTime: '29-04-2025 08:45 PM',
      plus: '-',
      minus: '7,500',
      net: '-7,500'
    },
    { 
      id: 'FANCY004',
      name: 'Highest Individual Score',
      result: '89',
      declareTime: '29-04-2025 11:15 PM',
      plus: '15,000',
      minus: '-',
      net: '+15,000'
    },
    { 
      id: 'FANCY005',
      name: 'Total Boundaries',
      result: '28',
      declareTime: '29-04-2025 11:20 PM',
      plus: '-',
      minus: '9,800',
      net: '-9,800'
    }
  ];

  const handleBackClick = () => {
    navigate('/sportdetail');
  };

  // Calculate net total
  const netTotal = completedFanciesData.reduce((sum, item) => {
    const value = item.net.startsWith('+') 
      ? parseInt(item.net.replace(/[+,]/g, '')) 
      : -parseInt(item.net.replace(/[-,]/g, ''));
    return sum + value;
  }, 0);

  const formattedNetTotal = netTotal >= 0 
    ? `+${netTotal.toLocaleString()}` 
    : netTotal.toLocaleString();

  return (
    <div className="sport-detail-container">
      {/* Header */}
      <div className="sport-detail-header">
        <h1>Completed Fancies</h1>
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>

      {/* Match Info */}
      <div className="match-info">
        <div className="match-code">Code: <span>{matchCode}</span></div>
        <div className="match-name">Name: <span>{matchName}</span></div>
      </div>

      {/* Completed Fancies Table */}
      <div className="table-responsive">
        <table className="sports-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fancy Name</th>
              <th>Result</th>
              <th>Declare Time</th>
              <th>Plus</th>
              <th>Minus</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {completedFanciesData.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.result}</td>
                <td>{item.declareTime}</td>
                <td className="amount-column plus">{item.plus}</td>
                <td className="amount-column minus">{item.minus}</td>
                <td className={`amount-column ${item.net.startsWith('+') ? 'plus' : 'minus'}`}>
                  {item.net}
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="6"><strong>Net Total</strong></td>
              <td className={`amount-column ${netTotal >= 0 ? 'plus' : 'minus'}`}>
                <strong>{formattedNetTotal}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SportCompletedFancies;