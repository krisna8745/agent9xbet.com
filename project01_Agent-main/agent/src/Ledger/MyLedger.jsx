// import React, { useState, useEffect } from 'react';
// import './MyLedger.css';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useProfile } from '../context/ProfileContext';
// const MyLedger = () => {
//   const { profile } = useProfile();
//   const agentId = profile?.AgentNo;

//   const [transactions, setLedgerData] = useState([]);
//   const [agentbal,setAgentbal]=useState(0);

//   const [ledgerMap, setLedgerMap] = useState({});
//   const [lenaUsers, setLenaUsers] = useState([]);
//   const [denaUsers, setDenaUsers] = useState([]);
//   const [totalLena, setTotalLena] = useState(0);
//   const [totalDena, setTotalDena] = useState(0);

// /* ================= FETCH LEDGER ================= */
// useEffect(() => {
//   const fetchClientLedger = async () => {
//     const storedAgent = JSON.parse(localStorage.getItem('agent'));
//     if (!storedAgent?.id) return;

//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}/api/getledgerstement/${storedAgent.id}`
//       );

//       const data = res.data.data || [];

//       /* ✅ ONLY SUBADMIN ROLE, MOST RECENT ONE ENTRY */
//       const subadminOnly = data.filter(item => item.role === 'agent');
//       const sorted = [...subadminOnly].sort(
//         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//       );
//       const recentEntry = sorted[0] || null;

//       if (recentEntry) {
//         /* closeBal > 0 → Debit column + Dena at top; closeBal < 0 → Credit column + Lena at top */
//         const closeBal = Number(recentEntry.closeBal) || 0;
//         const amount = Number(recentEntry.amount) || 0;
//         const debitVal = closeBal > 0 ? amount : 0;
//         const creditVal = closeBal < 0 ? Math.abs(amount) : 0;

//         setLedgerData([{
//           id: recentEntry._id || recentEntry.createdAt,
//           date: recentEntry.createdAt,
//           collectionName: recentEntry.event || '',
//           debit: debitVal,
//           credit: creditVal,
//           balance: closeBal,
//           paymentType: recentEntry.txnBy || '',
//           remark: recentEntry.matchname || recentEntry.remark || '',
//         }]);
//       } else {
//         setLedgerData([]);
//       }

//       /* Keep grouped for lena/dena if needed elsewhere */
//       const grouped = subadminOnly.reduce((acc, item) => {
//         const userKey = item.user;
//         if (!acc[userKey]) acc[userKey] = [];
//         acc[userKey].push({
//           date: item.createdAt,
//           credit: item.type === 'CREDIT' ? (Number(item.amount) || 0) : 0,
//           debit: item.type === 'DEBIT' ? (Number(item.amount) || 0) : 0,
//           matchComm: item.matchComm || 0,
//           balance: item.closeBal,
//           remark: item.remark,
//         });
//         return acc;
//       }, {});
//       setLedgerMap(grouped);
//     } catch (error) {
//       console.error('Error fetching ledger:', error);
//       setLedgerData([]);
//     }
//   };

//   if (agentId) fetchClientLedger();
// }, [agentId]);

// /* ================= CALCULATE LENA / DENA ================= */
// useEffect(() => {
//   const lenaArr = [];
//   const denaArr = [];
//   let lenaSum = 0;
//   let denaSum = 0;

//   Object.entries(ledgerMap).forEach(([user, transactions]) => {
//     let netBalance = 0;

//     transactions.forEach(tx => {
//       // For CREDIT: subtract matchComm from amount (effective credit = amount - matchComm)
//       if (tx.credit > 0) {
//         netBalance += (tx.credit);
//       }
//       // For DEBIT: subtract (amount - matchComm) to account for commission
//       if (tx.debit > 0) {
//         netBalance -= (tx.debit);
//       }
//     });

//     if (netBalance >= 0) {
//       lenaArr.push({ userId: user, balance: netBalance.toFixed(2) });
//       lenaSum += netBalance;
//     } else {
//       denaArr.push({ userId: user, balance: Math.abs(netBalance).toFixed(2) });
//       denaSum += Math.abs(netBalance);
//     }
//   });

//   setLenaUsers(lenaArr);
//   setDenaUsers(denaArr);
//   setTotalLena(lenaSum);
//   setTotalDena(denaSum);
// }, [ledgerMap]);
  
  
  
//   const [lenaTotal, setLenaTotal] = useState(0);
//   const [denaTotal, setDenaTotal] = useState(0);
//   const [finalBalance, setFinalBalance] = useState(0);
//   const [balanceType, setBalanceType] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     // From API: closeBal > 0 → Dena (debit); closeBal < 0 → Lena (credit)
//     let lena = 0;
//     let dena = 0;
//     if (agentbal > 0) {
//       dena += agentbal;
//     } else if (agentbal < 0) {
//       lena += Math.abs(agentbal);
//     }
//     transactions.forEach(transaction => {
//       if (transaction.credit > 0) lena += transaction.credit;
//       if (transaction.debit > 0) dena += transaction.debit;
//     });
//     setLenaTotal(lena);
//     setDenaTotal(dena);
//     const balance = transactions.length > 0 ? transactions[0].balance : lena - dena;
//     setFinalBalance(balance);
//     setBalanceType(balance >= 0 ? 'Dena' : 'Lena');
//   }, [transactions, agentbal]);

//   const handleBackClick = () => {
//     // Handle back button click
//     navigate(-1);
      
//   };

//   const formatDate = (dateString) => {
//     // Format date for better display on mobile
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: '2-digit', 
//       month: 'short', 
//       day: 'numeric' 
//     });
//   };

//   return (
//     <div className="ledger-container">
//       <div className="ledger-header">
//         <div className="ledger-title">My Ledger</div>
//         <button className="back-button" onClick={handleBackClick}>Back</button>
//       </div>
      
//       <div className="balance-summary">
//         <div className="top-balance-row">
//           <div className="lena-balance">Lena : {lenaTotal.toFixed(2)}</div>
//           <div className="dena-balance">Dena : {denaTotal.toFixed(2)}</div>
//         </div>
//         <div className="bottom-balance-row">
//           <div className="total-balance">Balance: {finalBalance.toFixed(2)} ( {balanceType} )</div>
//         </div>
//       </div>
      
//       <div className="ledger-table">
//         <div className="table-header">
//           <div className="header-cell date">Date</div>
//           <div className="header-cell collection">Event Name</div>
//           <div className="header-cell debit">Debit</div>
//           <div className="header-cell credit">Credit</div>
//           <div className="header-cell balance">Balance</div>
//           <div className="header-cell payment">Payment Type</div>
//           <div className="header-cell remark">Remark</div>
//         </div>
        
//         {transactions.length > 0 ? (
//           <div className="table-body">
//             {transactions.map((transaction) => (
//               <div className="table-row" key={transaction.id}>
//                 <div className="cell date">{formatDate(transaction.date)}</div>
//                 <div className="cell collection">{transaction.collectionName}</div>
//                 <div className="cell debit">{transaction.debit ? transaction.debit.toFixed(2) : '-'}</div>
//                 <div className="cell credit">{transaction.credit ? transaction.credit.toFixed(2) : '-'}</div>
//                 <div className="cell balance">{transaction.balance != null ? Number(transaction.balance).toFixed(2) : '-'}</div>
//                 <div className="cell payment">{transaction.paymentType || '-'}</div>
//                 <div className="cell remark">{transaction.remark || '-'}</div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="no-data-container">
//             <div className="no-data-icon">
//               <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="#CCCCCC"/>
//                 <path d="M14 17H10V15H14V17ZM17 12H7V6H17V12Z" fill="#CCCCCC"/>
//               </svg>
//             </div>
//             <div className="no-data-text">No Data</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyLedger;



import React, { useState, useEffect } from 'react';
import './MyLedger.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProfile } from '../context/ProfileContext';
const MyLedger = () => {
  const { profile } = useProfile();
  const agentId = profile?.AgentNo;

  const [transactions, setLedgerData] = useState([]);
  const [agentbal, setAgentbal] = useState(0);

  const [ledgerMap, setLedgerMap] = useState({});
  const [lenaUsers, setLenaUsers] = useState([]);
  const [denaUsers, setDenaUsers] = useState([]);
  const [totalLena, setTotalLena] = useState(0);
  const [totalDena, setTotalDena] = useState(0);

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

        /* ✅ ONLY SUBADMIN ROLE */
        const subadminOnly = data.filter(item => item.role === 'agent');
        console.log(subadminOnly);

        /* ✅ GROUP BY UNIQUE MATCH (matchId if present, else matchname) */
        const matchGroups = subadminOnly.reduce((acc, item) => {
          const key = item.matchname || 'NO_MATCH';
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});

        /* ✅ BUILD ONE LEDGER ROW PER UNIQUE MATCH (COMBINE ALL ENTRIES WITH SAME matchname) */
        const matchRows = Object.values(matchGroups).map(group => {
          const sortedGroup = [...group].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          const recentEntry = sortedGroup[0];

          const closeBal = Number(recentEntry.closeBal) || 0;

          // Sum all DEBIT and CREDIT amounts inside this match group
          const { totalDebit, totalCredit } = group.reduce(
            (acc, item) => {
              const amt = Number(item.amount) || 0;
              if (item.type === 'DEBIT') acc.totalDebit += amt;
              if (item.type === 'CREDIT') acc.totalCredit += amt;
              return acc;
            },
            { totalDebit: 0, totalCredit: 0 }
          );

          return {
            id: recentEntry._id || recentEntry.createdAt,
            date: recentEntry.createdAt,
            collectionName: "Cricket",
            // Combined debit/credit for this match (one row per matchname)
            debit: totalDebit,
            credit: totalCredit,
            balance: closeBal,
            paymentType: recentEntry.txnBy || '',
            // Remark shows match name (grouped by matchname)
            remark: `${recentEntry.matchname || recentEntry.remark || ''}`,
          };
        });

        // Sort final rows by date (latest first)
        matchRows.sort((a, b) => new Date(b.date) - new Date(a.date));

        setLedgerData(matchRows);

        /* Keep grouped for lena/dena if needed elsewhere (per user) */
        const grouped = subadminOnly.reduce((acc, item) => {
          const userKey = item.user;
          if (!acc[userKey]) acc[userKey] = [];
          acc[userKey].push({
            date: item.createdAt,
            credit: item.type === 'CREDIT' ? (Number(item.amount) || 0) : 0,
            debit: item.type === 'DEBIT' ? (Number(item.amount) || 0) : 0,
            matchComm: item.matchComm || 0,
            balance: item.closeBal,
            remark: item.remark,
          });
          return acc;
        }, {});
        setLedgerMap(grouped);
      } catch (error) {
        console.error('Error fetching ledger:', error);
        setLedgerData([]);
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

    Object.entries(ledgerMap).forEach(([user, transactions]) => {
      let netBalance = 0;

      transactions.forEach(tx => {
        // For CREDIT: subtract matchComm from amount (effective credit = amount - matchComm)
        if (tx.credit > 0) {
          netBalance += (tx.credit);
        }
        // For DEBIT: subtract (amount - matchComm) to account for commission
        if (tx.debit > 0) {
          netBalance -= (tx.debit);
        }
      });

      if (netBalance >= 0) {
        lenaArr.push({ userId: user, balance: netBalance.toFixed(2) });
        lenaSum += netBalance;
      } else {
        denaArr.push({ userId: user, balance: Math.abs(netBalance).toFixed(2) });
        denaSum += Math.abs(netBalance);
      }
    });

    setLenaUsers(lenaArr);
    setDenaUsers(denaArr);
    setTotalLena(lenaSum);
    setTotalDena(denaSum);
  }, [ledgerMap]);



  const [lenaTotal, setLenaTotal] = useState(0);
  const [denaTotal, setDenaTotal] = useState(0);
  const [finalBalance, setFinalBalance] = useState(0);
  const [balanceType, setBalanceType] = useState('');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    // From API: closeBal > 0 → Dena (debit); closeBal < 0 → Lena (credit)
    let lena = 0;
    let dena = 0;
    if (agentbal > 0) {
      dena += agentbal;
    } else if (agentbal < 0) {
      lena += Math.abs(agentbal);
    }
    transactions.forEach(transaction => {
      if (transaction.credit > 0) lena += transaction.credit;
      if (transaction.debit > 0) dena += transaction.debit;
    });
    setLenaTotal(lena);
    setDenaTotal(dena);
    const balance = transactions.length > 0 ? transactions[0].balance : lena - dena;
    setFinalBalance(balance);
    setBalanceType(balance >= 0 ? 'Dena' : 'Lena');
  }, [transactions, agentbal]);

  // Pagination helpers
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = transactions.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(transactions.length / rowsPerPage) || 1;

  const handleBackClick = () => {
    // Handle back button click
    navigate(-1);

  };

  const formatDate = (dateString) => {
    // Format date for better display on mobile
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="ledger-container">
      <div className="ledger-header">
        <div className="ledger-title">My Ledger</div>
        <button className="back-button" onClick={handleBackClick}>Back</button>
      </div>

      <div className="balance-summary">
        <div className="top-balance-row">
          <div className="lena-balance">Lena : {lenaTotal.toFixed(2)}</div>
          <div className="dena-balance">Dena : {denaTotal.toFixed(2)}</div>
        </div>
        <div className="bottom-balance-row">
          <div className="total-balance">Balance: {finalBalance.toFixed(2)} ( {balanceType} )</div>
        </div>
      </div>

      <div className="ledger-table">
        <div className="table-header">
          <div className="header-cell date">Date</div>
          <div className="header-cell collection">Event</div>
          <div className="header-cell debit">Debit</div>
          <div className="header-cell credit">Credit</div>
          <div className="header-cell balance">Balance</div>
          {/* <div className="header-cell payment">Payment</div> */}
          <div className="header-cell remark" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%"
          }}>Match</div>
        </div>

        {transactions.length > 0 ? (
          <div className="table-body">
            {currentRows.map((transaction) => {
              const debitVal = Number(transaction.debit) || 0;
              const creditVal = Number(transaction.credit) || 0;
              const net = creditVal - debitVal;
              const displayCredit = net < 0 ? Math.abs(net) : 0;
              const displayDebit = net > 0 ? net : 0;

              return (
                <div className="table-row" key={transaction.id}>
                  <div className="cell date">{formatDate(transaction.date)}</div>
                  <div className="cell collection">{transaction.collectionName}</div>
                  <div className="cell debit">{displayDebit ? displayDebit.toFixed(2) : '-'}</div>
                  <div className="cell credit">{displayCredit ? displayCredit.toFixed(2) : '-'}</div>
                  <div className="cell balance">{transaction.balance != null ? Number(transaction.balance).toFixed(2) : '-'}</div>
                  {/* <div className="cell payment">{transaction.paymentType || '-'}</div> */}
                  <div className="cell remark">{transaction.remark || '-'}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-data-container">
            <div className="no-data-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="#CCCCCC" />
                <path d="M14 17H10V15H14V17ZM17 12H7V6H17V12Z" fill="#CCCCCC" />
              </svg>
            </div>
            <div className="no-data-text">No Data</div>
          </div>
        )}
      </div>
      {transactions.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyLedger;
