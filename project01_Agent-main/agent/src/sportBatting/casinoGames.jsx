import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './finishGames.css';

const FinishGames = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('2025-04-20');
  const [endDate, setEndDate] = useState('2025-05-03');
  const [games] = useState([
    {
      id: 1,
      name: 'Tigers vs Eagles',
      time: '2025-04-21',
      wonBy: 'Tigers (8-5)',
      plusMinus: '+230'
    },
    {
      id: 2,
      name: 'Bears vs Lions',
      time: '2025-04-23',
      wonBy: 'Bears (6-2)',
      plusMinus: '+150'
    },
    {
      id: 3,
      name: 'Sharks vs Panthers',
      time: '2025-04-25',
      wonBy: 'Panthers (4-3)',
      plusMinus: '-100'
    },
    {
      id: 4,
      name: 'Hawks vs Falcons',
      time: '2025-04-30',
      wonBy: 'Hawks (7-6)',
      plusMinus: '+180'
    }
  ]);

  const handleBack = () => {
    navigate('/');
  };

  const getPlusMinusStyle = (value) => {
    if (value.startsWith('+')) {
      return { color: '#28a745' }; // Green for positive
    } else if (value.startsWith('-')) {
      return { color: '#dc3545' }; // Red for negative
    }
    return {};
  };

  return (
    <div className="finish-games-container">
      <div className="header">
        <h1>Casino Games Detail</h1>
        <button className="back-button" onClick={handleBack}>
          Back
        </button>
      </div>

      <div className="date-filter">
        <input
          type="text"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          readOnly
        />
        <span className="date-separator">~</span>
        <input
          type="text"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          readOnly
        />
        <button className="date-select-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
      </div>

      <div className="games-table-container">
        <table className="games-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Time</th>
              <th>Won by</th>
              <th className="plus-minus-col">Plus Minus</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id}>
                <td>{game.name}</td>
                <td>{game.time}</td>
                <td>{game.wonBy}</td>
                <td className="plus-minus-cell" style={getPlusMinusStyle(game.plusMinus)}>
                  {game.plusMinus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinishGames;
