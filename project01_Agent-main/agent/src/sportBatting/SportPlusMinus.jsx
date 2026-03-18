import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './sportDetail.css';

const SportPlusMinus = () => {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the match details from navigation state
  const matchCode = location.state?.code || 'N/A';
  const matchName = location.state?.name || 'Unknown Match';

  const summaryData = [
    {
      code: 'C53414',
      name: 'Ravi',
      matchAmt: '-42500.00',
      sessionAmt: '0.00',
      total: '-42500.00',
      matchComm: '0.00',
      sessionComm: '0.00',
      totalComm: '0.00',
      totalAmount: '-42500.00',
      myShare: '-42500.00',
      mApp: '0.00',
      netAmount: '-42500.00',
    },
    {
      code: 'C54347',
      name: 'Bhai',
      matchAmt: '-4000.00',
      sessionAmt: '0.00',
      total: '-4000.00',
      matchComm: '0.00',
      sessionComm: '0.00',
      totalComm: '0.00',
      totalAmount: '-4000.00',
      myShare: '-4000.00',
      mApp: '0.00',
      netAmount: '-4000.00',
    },
    {
      code: 'C98765',
      name: 'Amit Singh',
      matchAmt: '75000.00',
      sessionAmt: '10000.00',
      total: '85000.00',
      matchComm: '1500.00',
      sessionComm: '200.00',
      totalComm: '1700.00',
      totalAmount: '83300.00',
      myShare: '0.00',
      mApp: '0.00',
      netAmount: '83300.00',
    },
    {
      code: 'D11223',
      name: 'Vikas Sharma',
      matchAmt: '-15000.00',
      sessionAmt: '2000.00',
      total: '-13000.00',
      matchComm: '300.00',
      sessionComm: '40.00',
      totalComm: '340.00',
      totalAmount: '-12660.00',
      myShare: '0.00',
      mApp: '0.00',
      netAmount: '-12660.00',
    },
    {
      code: 'E44556',
      name: 'Mohit Gupta',
      matchAmt: '50000.00',
      sessionAmt: '0.00',
      total: '50000.00',
      matchComm: '1000.00',
      sessionComm: '0.00',
      totalComm: '1000.00',
      totalAmount: '49000.00',
      myShare: '0.00',
      mApp: '0.00',
      netAmount: '49000.00',
    },
  ];

  const calculateTotals = (data) => {
    const totals = {
      matchAmt: 0,
      sessionAmt: 0,
      total: 0,
      matchComm: 0,
      sessionComm: 0,
      totalComm: 0,
      totalAmount: 0,
      myShare: 0,
      mApp: 0,
      netAmount: 0,
    };

    data.forEach(item => {
      totals.matchAmt += parseFloat(item.matchAmt.replace(/,/g, ''));
      totals.sessionAmt += parseFloat(item.sessionAmt.replace(/,/g, ''));
      totals.total += parseFloat(item.total.replace(/,/g, ''));
      totals.matchComm += parseFloat(item.matchComm.replace(/,/g, ''));
      totals.sessionComm += parseFloat(item.sessionComm.replace(/,/g, ''));
      totals.totalComm += parseFloat(item.totalComm.replace(/,/g, ''));
      totals.totalAmount += parseFloat(item.totalAmount.replace(/,/g, ''));
      totals.myShare += parseFloat(item.myShare.replace(/,/g, ''));
      totals.mApp += parseFloat(item.mApp.replace(/,/g, ''));
      totals.netAmount += parseFloat(item.netAmount.replace(/,/g, ''));
    });

    for (const key in totals) {
      totals[key] = totals[key].toFixed(2);
    }

    return totals;
  };

  const summaryTotals = calculateTotals(summaryData);

  const getAmountColor = (amount) => {
    const value = parseFloat(String(amount).replace(/,/g, ''));
    if (value < 0) return 'red';
    return 'green';
  };

  const handleBackClick = () => {
    navigate('/sportdetail');
  };

  return (
    <div className="sport-detail-container">
      {/* Header */}
      <div className="sport-detail-header">
        <h1>Match and Session Plus Minus</h1>
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>

      {/* Match Info */}
      <div className="match-info">
        <div className="match-code">Code: <span>{matchCode}</span></div>
        <div className="match-name">Name: <span>{matchName}</span></div>
      </div>

 
      
      {/* Client Summary Table */}
      <div className="table-responsive" style={{ marginTop: '20px' }}>
        <table className="sports-table">
          <thead>
            <tr style={{ backgroundColor: '#1a3e5c', color: 'white' }}>
              <th>Code</th>
              <th>Name</th>
              <th>Match Amt</th>
              <th>Session Amt</th>
              <th>Total</th>
              <th>Match Comm+</th>
              <th>Session Comm+</th>
              <th>Total Comm</th>
              <th>Total Amount</th>
              <th>My Share</th>
              <th>M.App</th>
              <th>Net Amount</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((item, index) => (
              <tr key={index}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td style={{ color: getAmountColor(item.matchAmt), fontWeight: 'bold' }}>{item.matchAmt}</td>
                <td style={{ color: getAmountColor(item.sessionAmt), fontWeight: 'bold' }}>{item.sessionAmt}</td>
                <td style={{ color: getAmountColor(item.total), fontWeight: 'bold' }}>{item.total}</td>
                <td style={{ color: getAmountColor(item.matchComm), fontWeight: 'bold' }}>{item.matchComm}</td>
                <td style={{ color: getAmountColor(item.sessionComm), fontWeight: 'bold' }}>{item.sessionComm}</td>
                <td style={{ color: getAmountColor(item.totalComm), fontWeight: 'bold' }}>{item.totalComm}</td>
                <td style={{ color: getAmountColor(item.totalAmount), fontWeight: 'bold' }}>{item.totalAmount}</td>
                <td style={{ color: getAmountColor(item.myShare), fontWeight: 'bold' }}>{item.myShare}</td>
                <td style={{ color: getAmountColor(item.mApp), fontWeight: 'bold' }}>{item.mApp}</td>
                <td style={{ color: getAmountColor(item.netAmount), fontWeight: 'bold' }}>{item.netAmount}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: 'rgb(232, 232, 232)'}}>
              <td><strong>Total</strong></td>
              <td></td>
              <td style={{ color: getAmountColor(summaryTotals.matchAmt), fontWeight: 'bold' }}>{summaryTotals.matchAmt}</td>
              <td style={{ color: getAmountColor(summaryTotals.sessionAmt), fontWeight: 'bold' }}>{summaryTotals.sessionAmt}</td>
              <td style={{ color: getAmountColor(summaryTotals.total), fontWeight: 'bold' }}>{summaryTotals.total}</td>
              <td style={{ color: getAmountColor(summaryTotals.matchComm), fontWeight: 'bold' }}>{summaryTotals.matchComm}</td>
              <td style={{ color: getAmountColor(summaryTotals.sessionComm), fontWeight: 'bold' }}>{summaryTotals.sessionComm}</td>
              <td style={{ color: getAmountColor(summaryTotals.totalComm), fontWeight: 'bold' }}>{summaryTotals.totalComm}</td>
              <td style={{ color: getAmountColor(summaryTotals.totalAmount), fontWeight: 'bold' }}>{summaryTotals.totalAmount}</td>
              <td style={{ color: getAmountColor(summaryTotals.myShare), fontWeight: 'bold' }}>{summaryTotals.myShare}</td>
              <td style={{ color: getAmountColor(summaryTotals.mApp), fontWeight: 'bold' }}>{summaryTotals.mApp}</td>
              <td style={{ color: getAmountColor(summaryTotals.netAmount), fontWeight: 'bold' }}>{summaryTotals.netAmount}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SportPlusMinus;