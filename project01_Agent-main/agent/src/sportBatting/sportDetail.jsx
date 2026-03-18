import React, { useState, useEffect, useRef } from 'react';
import './sportDetail.css';
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const SportDetail = () => {
  const [startDate, setStartDate] = useState('2025-04-16');
  const [endDate, setEndDate] = useState('2025-05-07');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const calendarRef = useRef(null);

  // Handle clicks outside the dropdown or calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown when clicking outside
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) && 
        !event.target.closest('.dropdown-button')
      ) {
        setActiveDropdown(null);
      }
      
      // Close calendar when clicking outside
      if (calendarRef.current && !calendarRef.current.contains(event.target) &&
          !event.target.closest('.calendar-trigger')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const [sportsData, setLeagues] = useState([]);
  const socket = io(`${process.env.REACT_APP_BASE_URL}`);
  function formatDate(dateStr) {
    const [datePart, timePart] = dateStr.split(" ");
    const [day, month, year] = datePart.split("-");
    const [hour, minute] = timePart.split(":");
  
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  useEffect(() => {
    socket.on("updateMatches", (data) => {
      if (Array.isArray(data)) {
        const formattedData = data.map((item, index) => ({
          id: index + 1,
          code: item.eventId || 'N/A',
          name: item.matchName || 'Unknown',
          settings: 'No Change',
          time: formatDate(item.matchDate), // format function below
          competition: 'Unknown', // You can add logic to detect this from the name
          declare: 'NA',
          wonBy: '',
          plusMinus: 0,
          scoreIframe: item.scoreIframe,
          eventId: item.eventId,
        }));
  
        setLeagues(formattedData);
      } else {
        console.error("Data is not an array:", data);
      }
    });
  
    return () => socket.off("updateMatches");
  }, []);
  


  // // Dropdown menu options
  const dropdownOptions = [
    'Match and Session Position',
    // 'Agent Commission Report',
    // 'Match and Session Plus Minus',
    'Display Match Bets',
    'Display Session Bets',
    // 'Completed Fancies',
    'Rejected Bets'
  ];

  const handleBackClick = () => {
    // Handle back button click
    navigate('/');
    console.log('Back button clicked');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
    setActiveDropdown(null); // Close any open dropdown
  };

  const toggleDropdown = (id, event) => {
    event.stopPropagation(); // Prevent event from bubbling up

    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      // Get position of the clicked button
      const rect = event.currentTarget.getBoundingClientRect();
      const dropdownHeight = 250; // Approximate dropdown height
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Determine if dropdown should open above or below
      const shouldOpenAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      
      setDropdownPosition({
        top: shouldOpenAbove 
          ? rect.top + window.scrollY - dropdownHeight 
          : rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        openAbove: shouldOpenAbove
      });
      
      setActiveDropdown(id);
      setShowCalendar(false); // Close calendar if open
    }
  };

  const handleDropdownOptionClick = (option, event) => {
    event.stopPropagation(); // Prevent event from bubbling up
    console.log(`Selected option: ${option}`);
    
    // Get the sport details for the selected dropdown
    const selectedSport = sportsData.find(sport => sport.id === activeDropdown);
    
    // Navigate to different pages based on the selected option
    switch(option) {
      case 'Match and Session Position':
        navigate(`/sport-match-position/${activeDropdown}`, { state: { code: selectedSport.code, name: selectedSport.name },scoreIframe:selectedSport.scoreIframe });
        break;
      case 'Agent Commission Report':
        navigate(`/sport-agent-commission/${activeDropdown}`, { state: { code: selectedSport.code, name: selectedSport.name } });
        break;
      case 'Match and Session Plus Minus':
        navigate(`/sport-plus-minus/${activeDropdown}`, { state: { code: selectedSport.code, name: selectedSport.name } });
        break;
      case 'Display Match Bets':
        navigate(`/sport-match-bets/${activeDropdown}`, { state: { code: selectedSport.code, name: selectedSport.name } });
        break;
      case 'Display Session Bets':
        navigate(`/sport-session-bets/${activeDropdown}`, { state: { code: selectedSport.code, name: selectedSport.name } });
        break;
      case 'Completed Fancies':
        navigate(`/sport-completed-fancies/${activeDropdown}`, { state: { code: selectedSport.code, name: selectedSport.name } });
        break;
      case 'Rejected Bets':
        navigate(`/sport-rejected-bets/${activeDropdown}`, { state: { code: selectedSport.code, name: selectedSport.name } });
        break;
      default:
        break;
    }
    
    setActiveDropdown(null);
  };

  const handleQuickFilterClick = (filter) => {
    console.log(`Quick filter clicked: ${filter}`);
    // Implement date filtering logic based on selected filter
    setShowCalendar(false);
  };

  // Calendar data
  const renderCalendar = () => {
    const months = ['Apr 2025', 'May 2025'];
    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    // April 2025 calendar data (example)
    const aprilDays = [
      [30, 31, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10]
    ];
    
    // May 2025 calendar data (example)
    const mayDays = [
      [27, 28, 29, 30, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15, 16, 17],
      [18, 19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, 30, 31],
      [1, 2, 3, 4, 5, 6, 7]
    ];
    
    const calendars = [
      { month: months[0], days: aprilDays },
      { month: months[1], days: mayDays }
    ];

    const specialDates = {
      april: [16, 18, 29],
      may: [1, 7]
    };

    return (
      <div className="calendar-popup" ref={calendarRef}>
        <div className="calendar-header">
          <div className="date-range">
            {startDate} ~ {endDate}
          </div>
        </div>
        
        <div className="calendars-container">
          {calendars.map((calendar, calIndex) => (
            <div key={calIndex} className="calendar-month">
              <div className="month-header">
                <button className="nav-button">&lt;&lt;</button>
                <button className="nav-button">&lt;</button>
                <span className="month-name">{calendar.month}</span>
                <button className="nav-button">&gt;</button>
                <button className="nav-button">&gt;&gt;</button>
              </div>
              
              <table className="calendar-table">
                <thead>
                  <tr>
                    {daysOfWeek.map((day, i) => (
                      <th key={i}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calendar.days.map((week, weekIndex) => (
                    <tr key={weekIndex}>
                      {week.map((day, dayIndex) => {
                        const isCurrentMonth = 
                          (calIndex === 0 && day >= 1 && day <= 30) || 
                          (calIndex === 1 && day >= 1 && day <= 31);
                        
                        const isSpecialDate = 
                          (calIndex === 0 && specialDates.april.includes(day) && isCurrentMonth) || 
                          (calIndex === 1 && specialDates.may.includes(day) && isCurrentMonth);
                        
                        const isSelectedDate = 
                          (calIndex === 0 && day === 16 && isCurrentMonth) || 
                          (calIndex === 1 && day === 7 && isCurrentMonth);
                        
                        return (
                          <td 
                            key={dayIndex} 
                            className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''}
                                        ${isSpecialDate ? 'special-date' : ''}
                                        ${isSelectedDate ? 'selected-date' : ''}`}
                          >
                            {day}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        
        <div className="quick-filters">
          <button onClick={() => handleQuickFilterClick('today')}>Today</button>
          <button onClick={() => handleQuickFilterClick('yesterday')}>Yesterday</button>
          <button onClick={() => handleQuickFilterClick('this-week')}>This Week</button>
          <button onClick={() => handleQuickFilterClick('last-week')}>Last Week</button>
          <button onClick={() => handleQuickFilterClick('this-month')}>This Month</button>
          <button onClick={() => handleQuickFilterClick('last-month')}>Last Month</button>
        </div>
      </div>
    );
  };

  return (
    <div className="sport-detail-container">
      {/* Header */}
      <div className="sport-detail-header">
        <h1>Sports Detail</h1>
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="date-range-container">
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

      {/* Calendar Popup */}
      {showCalendar && renderCalendar()}

      {/* Sports Table */}
      <div className="table-responsive">
        <table className="sports-table">
          <thead>
            <tr>
              <th></th>
              <th>Code</th>
              <th>Name</th>
              <th>Settings</th>
              <th>Time</th>
              <th>Competition</th>
              <th>Declare</th>
              <th>Won by</th>
              <th>Plus Minus</th>
            </tr>
          </thead>
          <tbody>
            {sportsData.map((sport) => (
              <tr key={sport.id}>
                <td className="dropdown-cell">
                  <button 
                    className="dropdown-button" 
                    onClick={(e) => toggleDropdown(sport.id, e)}
                  >
                    ▼
                  </button>
                </td>
                <td>{sport.code}</td>
                <td>{sport.name}</td>
                <td>{sport.settings}</td>
                <td>{sport.time}</td>
                <td>{sport.competition}</td>
                <td>{sport.declare}</td>
                <td>{sport.wonBy}</td>
                <td className="plus-minus">{sport.plusMinus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown Menu (Fixed position) */}
      {activeDropdown && (
        <div 
          className={`popup-dropdown-menu ${dropdownPosition.openAbove ? 'open-above' : 'open-below'}`}
          style={{ 
            top: `${dropdownPosition.top}px`, 
            left: `${dropdownPosition.left}px` 
          }}
          ref={dropdownRef}
        >
          <ul>
            {dropdownOptions.map((option, index) => (
              <li key={index} onClick={(e) => handleDropdownOptionClick(option, e)}>
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button 
          className="pagination-button prev" 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        <button className="pagination-button active">1</button>
        <button 
          className="pagination-button next" 
          onClick={() => handlePageChange(currentPage + 1)}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default SportDetail;
