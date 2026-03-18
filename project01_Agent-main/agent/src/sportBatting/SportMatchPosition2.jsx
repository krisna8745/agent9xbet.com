import {React,useEffect,useState} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './sportDetail.css';
import styled from "styled-components";
import axios from 'axios';
import { useProfile } from '../context/ProfileContext';
const SportMatchPosition = () => {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile} = useProfile();
  // Get the match details from navigation state
  const matchCode = location.state?.code || 'N/A';
  const matchName = location.state?.name || 'Unknown Match';
  const iframeUrl = location.state?.iframeUrl;


  const [matchData, setBets] = useState([]);
  const agentId=profile.AgentNo;
  console.log(matchName)
   useEffect(() => {
  const fetchBets = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getmatchbets/${agentId}`);
      
      console.log(res.data);
 
      const transformedData = res.data
        .filter(bet => bet.match === matchName)
        .map(bet => ({
          rate: bet.odds?.toFixed(2) || '0.00',
          amount: bet.stake?.toFixed(2) || '0.00',
          date: new Date(bet.time).toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            day: '2-digit',
            month: 'short'
          }),
          team: bet.label || '',
          client: `${bet.user?.userNo || 'Unknown'}`,
          agent: `Agent (${bet.user?.agent || 'N/A'})`,
          type: bet.type || '',
          oddsType: 'bookmaker',
          loss: bet.teamAProfit < 0 ? Math.abs(bet.teamAProfit).toFixed(2) : '0.00',
          profit: bet.teamBProfit?.toFixed(2) || '0.00'
        }));

      setBets(transformedData);
    } catch (error) {
      console.error('Error fetching bets:', error);
    }
  };

  fetchBets();
}, [agentId]);



const [sessionData, setBets2] = useState([]);

useEffect(() => {
  const fetchBets = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getsessionbets/${agentId}`);
      
      console.log(res.data);
 
      const transformedData = res.data
        .filter(bet => bet.matchName=== matchName)
        .map(bet => ({
          session: bet.matbet,
          runs: bet.yesRuns || bet.noRuns,
          yes: bet.mode === 'yes' ? Number(bet.stake)?.toLocaleString('en-IN') : '',
          no: bet.mode === 'no' ? Number(bet.stake)?.toLocaleString('en-IN') : '',
    
        }));

        setBets2(transformedData);
    } catch (error) {
      console.error('Error fetching bets:', error);
    }
  };

  fetchBets();
}, [agentId]);

  // console.log(bets,"bets")
  // // Sample data for match position (update with your real data)
  // const matchData = [
  //   {
  //     rate: '7.00',
  //     amount: '10000.00',
  //     date: '13 Jun 09:54:59 PM',
  //     team: 'SOUTH AFRICA',
  //     client: 'Ravi C53414',
  //     agent: 'Ravi bhaiya (A12391)',
  //     type: 'Khaai',
  //     oddsType: 'bookmaker',
  //     loss: '700.00',
  //     profit: '10000.00'
  //   },
  //   {
  //     rate: '16.00',
  //     amount: '10000.00',
  //     date: '13 Jun 09:31:11 PM',
  //     team: 'SOUTH AFRICA',
  //     client: 'Ravi C53414',
  //     agent: 'Ravi bhaiya (A12391)',
  //     type: 'Khaai',
  //     oddsType: 'bookmaker',
  //     loss: '1600.00',
  //     profit: '10000.00'
  //   },
  //   // ... more rows as needed
  // ];

  // Sample data for session position
  // const sessionData = [
  //   { session: 'Session 1', runs: '120-125', yes: '6,000', no: '4,500' },
  //   { session: 'Session 2', runs: '240-245', yes: '8,200', no: '7,100' },
  //   { session: 'Session 3', runs: '315-320', yes: '5,500', no: '6,800' },
  // ];

  const handleBackClick = () => {
    navigate('/sportdetail');
  };

  return (
    <>
 
   
    <div className="sport-detail-container">
      {/* Header */}
      <div className="sport-detail-header">
        <h1>Match and Session Position</h1>
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>

      {/* Match Info */}
      <div className="match-info">
        <div className="match-code">Code: <span>{matchCode}</span></div>
        <div className="match-name">Name: <span>{matchName}</span></div>
      </div>

      {/* Match Position Section */}
      <h2 className="section-title">Match Position</h2>
      <div className="table-responsive">
        <table className="sports-table">
          <thead>
            <tr>
              <th>Rate</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Team</th>
              <th>Client</th>
              <th>Agent</th>
              <th>Type</th>
              <th>Odds Type</th>
              <th>Loss</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {matchData.map((item, index) => (
              <tr key={index}>
                <td>{item.rate}</td>
                <td>{item.amount}</td>
                <td>{item.date}</td>
                <td>{item.team}</td>
                <td>{item.client}</td>
                <td>{item.agent}</td>
                <td>{item.type}</td>
                <td>{item.oddsType}</td>
                <td>{item.loss}</td>
                <td>{item.profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Session Position Section */}
      <h2 className="section-title">Session Position</h2>
      <div className="table-responsive">
        <table className="sports-table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Runs</th>
              <th>Yes</th>
              <th>No</th>
            </tr>
          </thead>
          <tbody>
            {sessionData.map((item, index) => (
              <tr key={index}>
                <td>{item.session}</td>
                <td>{item.runs}</td>
                <td className="amount-column">{item.yes}</td>
                <td className="amount-column">{item.no}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};
const LiveScoreContainer = styled.div`
  background: linear-gradient(135deg, #1e1e2f, #2a2a40);
  width: 100%;
  height: 218px;
  margin-bottom: 20px;
  margin-top: 2rem;
  border-radius: 15px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
      
`;

const PlaceholderText = styled.p`
  color: #fff;
  text-align: center;
  font-size: 18px;
  margin: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export default SportMatchPosition; 