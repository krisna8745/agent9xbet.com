import React, { useState,useEffect, useMemo } from "react";
import "./AccountStatement.css";
import axios from 'axios';
import {useLocation  } from 'react-router-dom';

const PAGE_SIZE = 12;


const AccountStatement = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    reportType: "ALL",
  });

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accountStatements, setAccountStatements] = useState([]);

  const location = useLocation();
  
  const { userId,userData} = location.state || {};
  const parentUser =userData?.originalData?.parentUser;
  console.log(userId,parentUser);
  
  useEffect(() => {
    const fetchAccountstm = async () => {
      setLoading(true);
      try {
        const storedAgent = JSON.parse(localStorage.getItem('agent'));
        if (!storedAgent || !storedAgent.id) {
          console.error('No agent data found in localStorage');
          setLoading(false);
          return;
        }
  
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getcurrentUserAccountstm/${storedAgent.id}`);
        console.log('API Response:', response);
        
        if (response.data && response.data.accountStatements) {
          // Filter by userId if provided
          let filteredStatements = response.data.accountStatements;
          if (userId) {
            filteredStatements = response.data.accountStatements.filter(
              (stmt) => stmt.userId === userId || stmt.userId?.toString() === userId?.toString()
            );
          }
          
          // Map API data to component format
          const mappedData = filteredStatements.map((stmt) => {
            const dateObj = stmt.createdAt ? new Date(stmt.createdAt) : new Date();
            return {
              _id: stmt._id,
              createdAt: dateObj.toISOString().split('T')[0],
              createdAtObj: dateObj,
              type: stmt.type,
              amount: stmt.amount || 0,
              balance: stmt.closeBal || 0,
              narration: stmt.narration || '',
              txnType: stmt.txnType,
              openBal: stmt.openBal || 0,
              closeBal: stmt.closeBal || 0,
            };
          });
          
          // Sort by date descending (newest first)
          mappedData.sort((a, b) =>b.createdAtObj-a.createdAtObj);
          
          setAccountStatements(mappedData);
        }
  
      } catch (error) {
        console.error('Error fetching fetchAccountstm:', error);
        setAccountStatements([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAccountstm();
  }, [userId]);
  
  const filteredData = useMemo(() => {
    return accountStatements.filter((item) => {
      // Date filtering
      if (filters.startDate) {
        const itemDate = new Date(item.createdAt).setHours(0, 0, 0, 0);
        const startDate = new Date(filters.startDate).setHours(0, 0, 0, 0);
        if (itemDate < startDate) return false;
      }
      if (filters.endDate) {
        const itemDate = new Date(item.createdAt).setHours(23, 59, 59, 999);
        const endDate = new Date(filters.endDate).setHours(23, 59, 59, 999);
        if (itemDate > endDate) return false;
      }
      
      // Report type filtering
      if (filters.reportType === "chip") {
        // Show only deposit/withdraw transactions (TRANSFER, UPDATELIMIT, OPENING)
        if (item.txnType && (item.txnType === "BET" || item.txnType === "WIN" || item.txnType === "REFUND")) {
          return false;
        }
      }
      if (filters.reportType === "game") {
        // Show only game transactions (BET, WIN, REFUND)
        if (item.txnType && item.txnType !== "BET" && item.txnType !== "WIN" && item.txnType !== "REFUND") {
          return false;
        }
      }
      return true;
    });
  }, [accountStatements, filters]);

  const pageCount = Math.ceil(filteredData.length / PAGE_SIZE);

  const paginatedData = filteredData.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  // Get opening balance from the oldest transaction's openBal, or 0 if no data
  // Since data is sorted newest first, the last item has the oldest transaction
  const openBalance = filteredData.length > 0 
    ? (Number(filteredData[filteredData.length - 1]?.openBal) || 0) 
    : 0;

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(0);
  };

  return (
    <div className="container">
      <h2 className="page-title">Account Statements</h2>

      {/* FILTER FORM */}
      {/* <form className="filter-form">
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
        />
        <select
          name="reportType"
          value={filters.reportType}
          onChange={handleChange}
        >
          <option value="ALL">All</option>
          <option value="chip">Deposit / Withdraw</option>
          <option value="game">Game Report</option>
        </select>
      </form> */}

      {/* LOADING STATE */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading account statements...
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Credit</th>
                <th>Debit</th>
                <th>Balance</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
            
              {!loading && paginatedData.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-data">
                    No Result Found
                  </td>
                </tr>
              )}

              {paginatedData.map((item, index) => (
                <tr key={item._id}>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="credit">
                    {item.type === "CREDIT" ? item.amount.toFixed(2) : "-"}
                  </td>
                  <td className="debit">
                    {item.type === "DEBIT" ? item.amount.toFixed(2) : "-"}
                  </td>
                  <td>{item.balance.toFixed(2)}</td>
                  <td>{item.narration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {!loading && pageCount > 0 && (
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            {"<<"}
          </button>
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <button
            disabled={page + 1 === pageCount}
            onClick={() => setPage(page + 1)}
          >
            {">>"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountStatement;
