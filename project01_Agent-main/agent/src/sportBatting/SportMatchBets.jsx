import {React,useState,useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './sportDetail.css';
import axios from 'axios';
import { useProfile } from '../context/ProfileContext';
const SportMatchBets = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [matchBetsData, setBets] = useState([]);
  const { profile} = useProfile();
  // Get the match details from navigation state
  const matchCode = location.state?.code || 'N/A';
  const matchName = location.state?.name || 'Unknown Match';
  const parentId=profile.userId;
  useEffect(() => {
    const fetchBets = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getmatchbetspeding/${parentId}`);
        
        console.log(res.data);
   
        const transformedData = res.data
          .filter(bet => bet.match === matchName)
          .map(bet => ({
            id: 'BET',
            client: `${bet.user?.userNo || 'Unknown'}`,

            date: new Date(bet.time).toLocaleString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
              day: '2-digit',
              month: 'short'
            }),
            team: bet.label || '',
            rate: bet.odds?.toFixed(2) || '0.00',
            amount: bet.stake?.toFixed(2) || '0.00',
            // agent: `Agent (${bet.user?.agent || 'N/A'})`,
            type: bet.type || '',
             status: 'Confirmed'
            // oddsType: 'bookmaker',
            // loss: bet.teamAProfit < 0 ? Math.abs(bet.teamAProfit).toFixed(2) : '0.00',
            // profit: bet.teamBProfit?.toFixed(2) || '0.00'
          }));
  
        setBets(transformedData);
      } catch (error) {
        console.error('Error fetching bets:', error);
      }
    };
  
    fetchBets();
  }, [parentId,matchName]);
  

  const handleBackClick = () => {
    navigate(-1);
  };

  // Calculate total stake
  const totalStake = matchBetsData.reduce((sum, item) => {
    const rawStake = item?.amount ?? '0'; // fallback to "0" if undefined/null
    const numericStake = parseInt(String(rawStake).replace(/,/g, '')) || 0;
    return sum + numericStake;
  }, 0).toLocaleString();

  return (
    <div className="sport-detail-container">
      {/* Header */}
      <div className="sport-detail-header">
        <h1>Match Bets</h1>
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>

      {/* Match Info */}
      <div className="match-info">
        <div className="match-code">Code: <span>{matchCode}</span></div>
        <div className="match-name">Name: <span>{matchName}</span></div>
      </div>

      {/* Match Bets Table */}
      <div className="table-responsive">
        <table className="sports-table">
          <thead>
            <tr>
              <th>Bet ID</th>
              <th>Client</th>
              <th>Date & Time</th>
              <th>Team</th>
              <th>Odds</th>
              <th>Stake</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {matchBetsData.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.client}</td>
                <td>{item.date}</td>
                <td>{item.team}</td>
                <td>{item.rate}</td>
                <td className="amount-column">{item.amount}</td>
                <td className={item.type === 'Back' ? 'back-type' : 'lay-type'}>
                  {item.type}
                </td>
                <td className={`status ${item.status.toLowerCase()}`}>{item.status}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="5"><strong>Total Stake</strong></td>
              <td className="amount-column"><strong>{totalStake}</strong></td>
              <td colSpan="2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SportMatchBets; 