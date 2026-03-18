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

        const data = res.data?.data || [];

        /* ✅ ONLY CLIENT ROLE */
        const clientOnly = data.filter(item => item.role === 'client');

        /* ✅ GROUP BY CLIENT */
        const grouped = clientOnly.reduce((acc, item) => {
          const userKey = item.user;
          if (!acc[userKey]) acc[userKey] = [];

          // 🔴 Commission already applied in backend
          const netAmount =
            Number(item.amount);

          acc[userKey].push({
            date: new Date(item.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
            debit: item.type === 'DEBIT' ? netAmount : 0,   // BET
            credit: item.type === 'CREDIT' ? netAmount : 0, // WIN
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

  /* ================= LENA / DENA CALCULATION ================= */
  useEffect(() => {
    const lenaArr = [];
    const denaArr = [];
    let lenaSum = 0;
    let denaSum = 0;

    Object.entries(ledgerMap).forEach(([user, transactions]) => {
      let netBalance = 0;

      transactions.forEach(tx => {
        netBalance += tx.debit;   // ✅ Client owes agent
        netBalance -= tx.credit;  // ✅ Agent owes client
      });

      if (netBalance > 0) {
        lenaArr.push({ userId: user, balance: netBalance.toFixed(2) });
        lenaSum += netBalance;
      } else if (netBalance < 0) {
        denaArr.push({
          userId: user,
          balance: Math.abs(netBalance).toFixed(2),
        });
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
        <div className="title">Client Ledger</div>
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
                <th>User</th>
                <th>Balance</th>
                <th>
                  <img src={money} alt="money" style={{ width: 24 }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {lenaUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-data">No Data</td>
                </tr>
              ) : (
                lenaUsers.map(user => (
                  <tr key={user.userId}>
                    <td>👁 {user.userId}</td>
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
                <th>User</th>
                <th>Balance</th>
                <th>
                  <img src={money} alt="money" style={{ width: 24 }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {denaUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-data">No Data</td>
                </tr>
              ) : (
                denaUsers.map(user => (
                  <tr key={user.userId}>
                    <td>👁 {user.userId}</td>
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
