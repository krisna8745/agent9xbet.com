import {React,useEffect,useState} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './sportDetail.css';
import axios from 'axios';
import { useProfile } from '../context/ProfileContext';
const SportSessionBets = () => {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile} = useProfile();
  // Get the match details from navigation state
  const matchCode = location.state?.code || 'N/A';
  const matchName = location.state?.name || 'Unknown Match';



  const [sessionBetsData, setBets2] = useState([]);
  const parentId=profile.userId;
 useEffect(() => {
  const fetchBets = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getsessionbetspending/${parentId}`);
      const transformedData = res.data
        .filter(bet => bet.matchName=== matchName)
        .map(bet => ({
          id:'SBET',
          client: `${bet.userId?.userNo || 'Unknown'}`,
          date: new Date(bet.time).toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            day: '2-digit',
            month: 'short'
          }),
          session: bet.matbet,
          runs: bet.yesRuns || bet.noRuns,
          rate: bet.rate?.toFixed(2) || '0.00',
          type:bet.mode,
          stake:bet.stake?.toFixed(2) || '0.00',
          status: 'Confirmed'
        }));

        setBets2(transformedData);
    } catch (error) {
      console.error('Error fetching bets:', error);
    }
  };

  fetchBets();
}, [parentId]); 
  

  const handleBackClick = () => {
    navigate(-1);
  };

  // Calculate total stake
  const totalStake = sessionBetsData.reduce((sum, item) => {
    return sum + parseInt(item.stake.replace(/,/g, ''));
  }, 0).toLocaleString();

  return (
    <div className="sport-detail-container">
      {/* Header */}
      <div className="sport-detail-header">
        <h1>Session Bets</h1>
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>

      {/* Match Info */}
      <div className="match-info">
        <div className="match-code">Code: <span>{matchCode}</span></div>
        <div className="match-name">Name: <span>{matchName}</span></div>
      </div>

      {/* Session Bets Table */}
      <div className="table-responsive">
        <table className="sports-table">
          <thead>
            <tr>
              <th>Bet ID</th>
              <th>Client</th>
              <th>Date & Time</th>
              <th>Session</th>
              <th>Runs</th>
              <th>Rate</th>
              <th>Type</th>
              <th>Stake</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sessionBetsData.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.client}</td>
                <td>{item.time}</td>
                <td>{item.session}</td>
                <td>{item.runs}</td>
                <td>{item.rate}</td>
                <td className={item.type === 'Yes' ? 'yes-type' : 'no-type'}>
                  {item.type}
                </td>
                <td className="amount-column">{item.stake}</td>
                <td className={`status ${item.status.toLowerCase()}`}>{item.status}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="7"><strong>Total Stake</strong></td>
              <td className="amount-column"><strong>{totalStake}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SportSessionBets;