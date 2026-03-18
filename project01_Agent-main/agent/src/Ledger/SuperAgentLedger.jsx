
// import React, { useState, useEffect } from 'react';
// import './ClientLedger.css';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useProfile } from '../context/ProfileContext';
// import money from '../money.jpg';

// const ClientLedger = () => {
//   const { profile } = useProfile();
//   const agentId = profile?.AgentNo;

//   const [ledgerMap, setLedgerMap] = useState({});
//   const [lenaUsers, setLenaUsers] = useState([]);
//   const [denaUsers, setDenaUsers] = useState([]);
//   const [totalLena, setTotalLena] = useState(0);
//   const [totalDena, setTotalDena] = useState(0);

//   const navigate = useNavigate();

//   /* ================= FETCH LEDGER ================= */
//   useEffect(() => {
//     const fetchClientLedger = async () => {
//       const storedAgent = JSON.parse(localStorage.getItem('agent'));
//       if (!storedAgent?.id) return;

//       try {
//         const res = await axios.get(
//           `${process.env.REACT_APP_BASE_URL}/api/getledgerstement/${storedAgent.id}`
//         );

//         const data = res.data.data || [];

//         /* ✅ ONLY AGENT ROLE */
//         const agentOnly = data.filter(item => item.role === 'superagent');

//         /* ✅ GROUP BY AGENT USER */
//         const grouped = agentOnly.reduce((acc, item) => {
//           const userKey = item.user;

//           if (!acc[userKey]) acc[userKey] = [];

//           acc[userKey].push({
//             date: new Date(item.createdAt).toLocaleString('en-GB', {
//               day: '2-digit',
//               month: 'short',
//               hour: '2-digit',
//               minute: '2-digit',
//               hour12: true,
//             }),
//             credit: item.type === 'CREDIT' ? item.amount : 0,
//             debit: item.type === 'DEBIT' ? item.amount : 0,
//             matchComm: item.matchComm || 0,
//             balance: item.closeBal,
//             remark: item.remark,
//           });

//           return acc;
//         }, {});

//         setLedgerMap(grouped);
//       } catch (error) {
//         console.error('Error fetching ledger:', error);
//       }
//     };

//     if (agentId) fetchClientLedger();
//   }, [agentId]);

//   /* ================= CALCULATE LENA / DENA ================= */
//   useEffect(() => {
//     const lenaArr = [];
//     const denaArr = [];
//     let lenaSum = 0;
//     let denaSum = 0;

//     Object.entries(ledgerMap).forEach(([user, transactions]) => {
//       let netBalance = 0;

//       transactions.forEach(tx => {
//         // For CREDIT: subtract matchComm from amount (effective credit = amount - matchComm)
//         if (tx.credit > 0) {
//           netBalance += (tx.credit);
//         }
//         // For DEBIT: subtract (amount - matchComm) to account for commission
//         if (tx.debit > 0) {
//           netBalance -= (tx.debit);
//         }
//       });

//       if (netBalance >= 0) {
//         lenaArr.push({ userId: user, balance: netBalance.toFixed(2) });
//         lenaSum += netBalance;
//       } else {
//         denaArr.push({ userId: user, balance: Math.abs(netBalance).toFixed(2) });
//         denaSum += Math.abs(netBalance);
//       }
//     });

//     setLenaUsers(lenaArr);
//     setDenaUsers(denaArr);
//     setTotalLena(lenaSum);
//     setTotalDena(denaSum);
//   }, [ledgerMap]);

//   const handleBack = () => navigate('/');

//   /* ================= UI ================= */
//   return (
//     <div className="client-ledger">
//       <div className="header">
//         <div className="title">Superagent Ledger</div>
//         <button className="back-button" onClick={handleBack}>
//           Back
//         </button>
//       </div>

//       <div className="client-columns">
//         {/* ================= LENA ================= */}
//         <div className="lena-column">
//           <div className="ledger-header" style={{
//               background: '#1bb81b',
//               color: '#fff',
//               fontWeight: 700,
//               fontSize: 28,
//               padding: 8,
//               borderRadius: 6,
//               marginBottom: 8,
//             }}
//           >
//             <span>Lena</span>
//             <span>{totalLena.toFixed(2)}</span>
//           </div>

//           <table className="ledger-table">
//             <thead>
//               <tr>
//                 <th>User Details</th>
//                 <th>Balance</th>
//                 <th>
//                   <img src={money} alt="money" style={{ width: 24 }} />
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {lenaUsers.length === 0 ? (
//                 <tr>
//                   <td colSpan="3" className="no-data">
//                     No Data
//                   </td>
//                 </tr>
//               ) : (
//                 lenaUsers.map(user => (
//                   <tr key={user.userId}>
//                     <td>
//                       <span style={{ color: '#007bff', cursor: 'pointer' }}>
//                         👁 {user.userId}
//                       </span>
//                     </td>
//                     <td>{user.balance}</td>
//                     <td>
//                       <img src={money} alt="money" style={{ width: 24 }} />
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* ================= DENA ================= */}
//         <div className="dena-column">
//           <div className="ledger-header" style={{
//               background: '#e53935',
//               color: '#fff',
//               fontWeight: 700,
//               fontSize: 28,
//               padding: 8,
//               borderRadius: 6,
//               marginBottom: 8,
//             }}
//           >
//             <span>Dena</span>
//             <span>{totalDena.toFixed(2)}</span>
//           </div>

//           <table className="ledger-table">
//             <thead>
//               <tr>
//                 <th>User Details</th>
//                 <th>Balance</th>
//                 <th>
//                   <img src={money} alt="money" style={{ width: 24 }} />
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {denaUsers.length === 0 ? (
//                 <tr>
//                   <td colSpan="3" className="no-data">
//                     No Data
//                   </td>
//                 </tr>
//               ) : (
//                 denaUsers.map(user => (
//                   <tr key={user.userId}>
//                     <td>
//                       <span style={{ color: '#007bff', cursor: 'pointer' }}>
//                         👁 {user.userId}
//                       </span>
//                     </td>
//                     <td>{user.balance}</td>
//                     <td>
//                       <img src={money} alt="money" style={{ width: 24 }} />
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClientLedger;




import React, { useState, useEffect } from 'react';
import './ClientLedger.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProfile } from '../context/ProfileContext';
import money from '../money.jpg';

const ClientLedger = () => {
  const { profile } = useProfile();
  const agentId = profile?.AgentNo;

  const [ledgerMap, setLedgerMap] = useState({});
  const [lenaUsers, setLenaUsers] = useState([]);
  const [denaUsers, setDenaUsers] = useState([]);
  const [totalLena, setTotalLena] = useState(0);
  const [totalDena, setTotalDena] = useState(0);

  const navigate = useNavigate();

  /* ================= FETCH LEDGER ================= */
  useEffect(() => {
    const fetchClientLedger = async () => {
      const storedAgent = JSON.parse(localStorage.getItem('agent'));
      if (!storedAgent?.id) return;

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/getledgerstement/${storedAgent.id}`
        );

        const data = res.data.data || [];

        /* ✅ ONLY AGENT ROLE */
        const agentOnly = data.filter(item => item.role === 'superagent');
    
        /* ✅ GROUP BY AGENT USER */
        const grouped = agentOnly.reduce((acc, item) => {
          const userKey = item.user;

          if (!acc[userKey]) {
            acc[userKey] = {
              transactions: [],
              userId: item.userId,
              userNo: item.userNo,
              userName: item.user
            };
          }

          acc[userKey].transactions.push({
            date: new Date(item.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
            credit: item.type === 'CREDIT' ? item.amount : 0,
            debit: item.type === 'DEBIT' ? item.amount : 0,
            matchComm: item.matchComm || 0,
            balance: item.closeBal,
            remark: item.remark,
          });

          return acc;
        }, {});

        setLedgerMap(grouped);
      } catch (error) {
        console.error('Error fetching ledger:', error);
      }
    };

    if (agentId) fetchClientLedger();
  }, [agentId]);

  /* ================= CALCULATE LENA / DENA ================= */
  useEffect(() => {
    const lenaArr = [];
    const denaArr = [];
    let lenaSum = 0;
    let denaSum = 0;

    Object.entries(ledgerMap).forEach(([userKey, userData]) => {
      let netBalance = 0;

      userData.transactions.forEach(tx => {
        // For CREDIT: subtract matchComm from amount (effective credit = amount - matchComm)
        if (tx.credit > 0) {
          netBalance += (tx.credit);
        }
        // For DEBIT: subtract (amount - matchComm) to account for commission
        if (tx.debit > 0) {
          netBalance -= (tx.debit);
        }
      });

      const userInfo = {
        userId: userData.userId,
        userNo: userData.userNo,
        userName: userData.userName,
        balance: netBalance.toFixed(2)
      };

      if (netBalance >= 0) {
        lenaArr.push(userInfo);
        lenaSum += netBalance;
      } else {
        userInfo.balance = Math.abs(netBalance).toFixed(2);
        denaArr.push(userInfo);
        denaSum += Math.abs(netBalance);
      }
    });

    setLenaUsers(lenaArr);
    setDenaUsers(denaArr);
    setTotalLena(lenaSum);
    setTotalDena(denaSum);
  }, [ledgerMap]);

  const handleBack = () => navigate('/');

  /* ================= UI ================= */
  return (
    <div className="client-ledger">
      <div className="header">
        <div className="title">Superagent Ledger</div>
        <button className="back-button" onClick={handleBack}>
          Back
        </button>
      </div>

      <div className="client-columns">
        {/* ================= LENA ================= */}
        <div className="lena-column">
          <div className="ledger-header" style={{
              background: '#1bb81b',
              color: '#fff',
              fontWeight: 700,
              fontSize: 28,
              padding: 8,
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            <span>Lena</span>
            <span>{totalLena.toFixed(2)}</span>
          </div>

          <table className="ledger-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Balance</th>
                <th>
                  <img src={money} alt="money" style={{ width: 24 }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {lenaUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-data">
                    No Data
                  </td>
                </tr>
              ) : (
                lenaUsers.map(user => (
                  <tr key={user.userId || user.userName}>
                    <td>
                      <span style={{ color: '#007bff', cursor: 'pointer' }}>
                        👁 {user.userName}({user.userNo})
                      </span>
                    </td>
                    <td>{user.balance}</td>
                    <td>
                      <img src={money} alt="money" style={{ width: 24 }} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= DENA ================= */}
        <div className="dena-column">
          <div className="ledger-header" style={{
              background: '#e53935',
              color: '#fff',
              fontWeight: 700,
              fontSize: 28,
              padding: 8,
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            <span>Dena</span>
            <span>{totalDena.toFixed(2)}</span>
          </div>

          <table className="ledger-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Balance</th>
                <th>
                  <img src={money} alt="money" style={{ width: 24 }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {denaUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-data">
                    No Data
                  </td>
                </tr>
              ) : (
                denaUsers.map(user => (
                  <tr key={user.userId || user.userName}>
                    <td>
                      <span style={{ color: '#007bff', cursor: 'pointer' }}>
                        👁 {user.userName}({user.userNo})
                      </span>
                    </td>
                    <td>{user.balance}</td>
                    <td>
                      <img src={money} alt="money" style={{ width: 24 }} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientLedger;
