import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfitLoss.css';

const ProfitLoss = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [total, setTotal] = useState(0);
  const [ledgerData, setLedgerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Set default dates (current month)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 3);
    
    setStartDate(formatDate(firstDayOfMonth));
    setEndDate(formatDate(nextMonth));
    
    // Mock data - replace with actual API call
    const mockData = [
      { id: 1, date: '2025-04-15', title: 'Sales Revenue', creditAmount: 5000, debitAmount: 0 },
      { id: 2, date: '2025-04-20', title: 'Utility Payment', creditAmount: 0, debitAmount: 500 },
      { id: 3, date: '2025-04-25', title: 'Rent Payment', creditAmount: 0, debitAmount: 1000 },
      { id: 4, date: '2025-05-01', title: 'Consulting Income', creditAmount: 3000, debitAmount: 0 },
    ];
    
    setLedgerData(mockData);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Filter data based on date range and filter type
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filtered = ledgerData.filter(item => {
        const itemDate = new Date(item.date);
        const dateCheck = itemDate >= start && itemDate <= end;
        
        if (filterType === 'All') {
          return dateCheck;
        } else if (filterType === 'event') {
          return dateCheck && item.title.includes('Event');
        } else if (filterType === 'casino') {
          return dateCheck && item.title.includes('Casino');
        } else if (filterType === 'livecasino') {
          return dateCheck && item.title.includes('Live Casino');
        }
        return false;
      });
      
      setFilteredData(filtered);
      
      // Calculate total
      let calculatedTotal = 0;
      filtered.forEach(item => {
        calculatedTotal += (item.creditAmount - item.debitAmount);
      });
      
      setTotal(calculatedTotal);
    }
  }, [startDate, endDate, filterType, ledgerData]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleBack = () => {
    navigate(-1);
  };
  
  const handleFilterChange = (value) => {
    setFilterType(value);
    setShowDropdown(false);
  };

  const renderDropdownOptions = () => {
    const options = [
      { value: 'All', label: 'All' },
      { value: 'event', label: 'Event' },
      { value: 'casino', label: 'Casino' },
      { value: 'livecasino', label: 'Live Casino' },

    ];
    
    return options.map(option => (
      <div 
        key={option.value} 
        className={`dropdown-option ${filterType === option.value ? 'selected' : ''}`}
        onClick={() => handleFilterChange(option.value)}
      >
        {option.label}
      </div>
    ));
  };

  return (
    <div className="profit-loss-container">
      <div className="header">
        <h1>Match Ledger</h1>
        <button className="back-button" onClick={handleBack}>Back</button>
      </div>
      
      <div className="filter-container">
        <div className="date-filter">
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="date-separator">~</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        <div className="filter-dropdown" ref={dropdownRef}>
          <div className="custom-dropdown" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="selected-option">{filterType}</div>
            {showDropdown && (
              <div className="dropdown-options">
                {renderDropdownOptions()}
              </div>
            )}
          </div>
        </div>
        
        <div className="total-display">
          Total: <span className={total >= 0 ? 'positive' : 'negative'}>{total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="ledger-table">
        <div className="table-header">
          <div className="header-cell date">Date</div>
          <div className="header-cell title">Title</div>
          <div className="header-cell cr">CR</div>
          <div className="header-cell dr">DR</div>
        </div>
        
        <div className="table-body">
          {filteredData.length > 0 ? (
            filteredData.map(item => {
              // Format date for display
              const dateObj = new Date(item.date);
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getDate()).padStart(2, '0');
              
              return (
                <div className="table-row" key={item.id}>
                  <div className="cell date">
                    <div className="date-display">
                      <div className="year-month">{year}-{month}</div>
                      <div className="day">{day}</div>
                    </div>
                  </div>
                  <div className="cell title">{item.title}</div>
                  <div className="cell cr">{item.creditAmount > 0 ? item.creditAmount.toFixed(2) : ''}</div>
                  <div className="cell dr">{item.debitAmount > 0 ? item.debitAmount.toFixed(2) : ''}</div>
                </div>
              );
            })
          ) : (
            <div className="no-data">
              <div className="no-data-icon">
                <i className="folder-icon"></i>
              </div>
              <div className="no-data-text">No Data</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;
