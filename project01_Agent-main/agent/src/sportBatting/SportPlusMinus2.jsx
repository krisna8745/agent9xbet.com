import React,{useState,useEffect} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './sportDetail.css';
import { useProfile } from '../context/ProfileContext';
import axios from 'axios'
const SportPlusMinus = () => {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the match details from navigation state
  const matchCode = location.state?.code || 'N/A';
  const matchName = location.state?.name || 'Unknown Match';

  const getAmountColor = (amount) => {
    const value = parseFloat(String(amount).replace(/,/g, ''));
    if (value < 0) return 'red';
    return 'green';
  };

  const handleBackClick = () => {
    navigate('/sportdetail');
  };

///////////////////////////////////////////////////////////////////



  const { profile} = useProfile();


  const [summaryData, setSummaryData] = useState([]);
  const [agentbal,setAgentbal]=useState(0);
  const agentId=profile.AgentNo;
  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/agent-ledger/${agentId}`);
       
        const data = response.data.data;
        const matchcomm = response.data.agentledge[0].matchComm;
        const sesscomm = response.data.agentledge[0].sessComm;
        const agentDetailsRes = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getagentblance/admin/${agentId}`);
        // Filter by eventName === matchName
        const filteredData = data.filter(item => item.eventName === matchName);
         console.log(filteredData);
        // Group by client and sum by comType
        const clientSummary = {};
        filteredData.forEach(item => {
          const client = item.client;
          if (!clientSummary[client]) {
            clientSummary[client] = {
              code: client,
              name: client, // Use client code as name if not available
              matchAmt: 0,
              sessionAmt: 0,
              matchComm: 0,
              sessionComm: 0,
              total: 0,
              totalComm: 0,
              totalAmount: 0,
              myShare: 0,
              mApp: 0,
              netAmount: 0,
            };
          }
          if (item.comType === "match") {
            // matchAmt is just credit - debit, commission is separate
            clientSummary[client].matchAmt += Number(item.credit) - Number(item.debit);
            clientSummary[client].matchComm +=(Number(item.credit) * matchcomm) / 100;
          } else if (item.comType === "session") {
            // sessionAmt is just credit - debit, commission is separate
            clientSummary[client].sessionAmt += Number(item.credit) - Number(item.debit);
            clientSummary[client].sessionComm += +(Number(item.credit) * sesscomm) / 100 - (Number(item.debit) * sesscomm) / 100;
          }
        });
        // Calculate totals and commissions
        Object.values(clientSummary).forEach(client => {
          client.total = client.matchAmt + client.sessionAmt;
          client.totalComm = client.matchComm + client.sessionComm;
          client.totalAmount = client.total - client.totalComm;
          client.netAmount = client.totalAmount;
          // Format to 2 decimals
          for (const key in client) {
            if (typeof client[key] === 'number') {
              client[key] = client[key].toFixed(2);
            }
          }
        });
        setSummaryData(Object.values(clientSummary));
        setAgentbal(agentDetailsRes.data.totalBalance)
      } catch (error) {
        console.error('Error fetching agent ledger:', error);
      }
    };
  
    fetchLedger();
  }, [agentId,profile.balance,matchName]);




///////////////////////////////////////////////////////////////////////




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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SportPlusMinus;