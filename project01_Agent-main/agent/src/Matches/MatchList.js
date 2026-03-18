import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaTv, FaRegClock } from 'react-icons/fa';
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';

const MatchListContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 10px;
  overflow: hidden;
`;

const MatchListHeader = styled.div`
    background: linear-gradient(45deg, #ffd700, #ffbf00, #ffaa00);
  color: white;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
 margin-top:17px
`;

const SportTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  img {
    height: 24px;
    width: auto;
  }
  
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  @media (max-width: 576px) {
    h2 {
      font-size: 16px;
    }
    
    img {
      height: 20px;
    }
  }
`;

const MatchTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const TableHeader = styled.thead`
  background-color: #f0f2f5;
  
  th {
    padding: 6px 8px;
    text-align: center;
    font-weight: 500;
    color: #4a5568;
    border-bottom: 1px solid #e2e8f0;
    font-size: 13px;
    
    &:first-child {
      text-align: left;
      width: 40%;
    }
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableBody = styled.tbody`
  tr {
    &:hover {
      background-color: #f8f9fa;
    }
    
    &:not(:last-child) {
      border-bottom: 0px solid #e2e8f0;
    }
  }
  
  td {
    padding: 8px;
    text-align: center;
    
    &:first-child {
      text-align: left;
    }
  }
  
  @media (max-width: 768px) {
    display: block;
    
    tr {
      display: flex;
      flex-wrap: wrap;
      padding: 0px 0;
      position: relative;
    }
    
    td {
      padding: 6px 8px;
      
      &:first-child {
        flex: 0 0 100%;
        padding-bottom: 0;
      }
      
      &:not(:first-child) {
        flex: 1;
        min-width: 80px;
        margin-top: 0px;
      }
    }
  }
`;

const MatchInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const MatchTitle = styled(Link)`
  color: #2d3748;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 4px;
  transition: color 0.2s;
  font-size: 13px;
  
  &:hover {
    color: #3c4d6d;
  }
  
  @media (max-width: 576px) {
    font-size: 12px;
  }
`;

const MatchMeta = styled.div`
  display: flex;
  align-items: center;
  color: #718096;
  font-size: 11px;
  flex-wrap: wrap;
  
  svg {
    margin-right: 4px;
  }
  
  span {
    margin-right: 10px;
    display: flex;
    align-items: center;
    margin-bottom: 2px;
    
    &.live {
      color: #e53e3e;
      font-weight: 600;
      background-color: rgba(229, 62, 62, 0.1);
      padding: 2px 4px;
      border-radius: 4px;
      margin-right: 8px;
    }
  }
  
  @media (max-width: 576px) {
    font-size: 10px;
    
    span {
      margin-right: 8px;
    }
  }
`;

const OddsButtonContainer = styled.div`
  display: flex;
  width: 100%;
`;

const OddsButton = styled.div`
  background-color: ${props => props.$isBack 
    ? (props.$type === '1' ? '#90caf9' : props.$type === 'X' ? '#90caf9' : '#90caf9')
    : (props.$type === '1' ? '#f8bbd0' : props.$type === 'X' ? '#f8bbd0' : '#f8bbd0')
  };
  color: ${props => props.$isBack ? '#0d47a1' : '#b71c1c'};
  padding: 10px 0;
  flex: 1;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.$isBack ? '#64b5f6' : '#f48fb1'};
  
  &:hover {
    background-color: ${props => props.$isBack ? '#64b5f6' : '#f48fb1'};
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 8px 0;
    font-size: 14px;
  }
`;

const LiveTag = styled.span`
  background-color: #4caf50;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 3px;
  text-transform: uppercase;
  margin-right: 6px;
`;

const NoMatchesMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #718096;
  font-size: 16px;
  
  p {
    margin: 0 0 10px;
  }
  
  svg {
    font-size: 32px;
    margin-bottom: 10px;
    color: #a0aec0;
  }
  
  @media (max-width: 576px) {
    padding: 30px 20px;
    
    svg {
      font-size: 28px;
    }
    
    p {
      font-size: 14px;
    }
  }
`;

// Sample match data for development/testing
const sampleMatches = [
  {
    id: '1',
    title: 'India vs Australia',
    date: '2023-06-15',
    time: '14:00',
    isLive: true,
    hasStream: true,
    odds: { '1': '1.85', 'X': '3.40', '2': '4.50' }
  },
  {
    id: '2',
    title: 'England vs New Zealand',
    date: '2023-06-15',
    time: '16:30',
    isLive: false,
    hasStream: false,
    odds: { '1': '2.10', 'X': '3.25', '2': '3.75' }
  },
  {
    id: '3',
    title: 'South Africa vs Pakistan',
    date: '2023-06-16',
    time: '10:00',
    isLive: false,
    hasStream: true,
    odds: { '1': '2.50', 'X': '3.30', '2': '2.90' }
  }
];

// Helper function to format ISO date string to readable format
const formatDate = (isoString) => {
  if (!isoString) return 'TBD';
  
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'TBD';
  }
};

// Helper function to format ISO date string to time
const formatTime = (isoString) => {
  if (!isoString) return 'TBD';
  
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return 'TBD';
  }
};

// Helper function to extract match name from backend data
const extractMatchName = (match) => {
  // console.log("Extracting match name from:", match); // Debug log to see the match object structure
  
  // For cricket matches, the event_name field typically contains the match name
  if (match.event_name) return match.event_name;
  
  // Try different properties where match name might be stored
  if (match.match_name) return match.match_name;
  if (match.name) return match.name;
  
  // Check for team names
  if (match.home_team && match.away_team) return `${match.home_team} vs ${match.away_team}`;
  
  // Check for runnerNames which is common in cricket API responses
  if (match.runnerNames && Array.isArray(match.runnerNames) && match.runnerNames.length >= 2) {
    return `${match.runnerNames[0].RN} vs ${match.runnerNames[1].RN}`;
  }
  
  // Check for teams array
  if (match.teams && Array.isArray(match.teams) && match.teams.length >= 2) {
    return `${match.teams[0]} vs ${match.teams[1]}`;
  }
  
  // If we can't find a proper name, use the title or a default with more information
  if (match.title) return match.title;
  if (match.league_name) return `${match.league_name} Match ${match.matchId || match.id || ''}`;
  
  // Last resort - create a more descriptive default
  return `Cricket Match ${match.matchId || match.id || match.event_id || ''}`;
};

// Helper function to extract odds from runners
const extractOddsFromRunners = (match) => {
  const defaultOdds = { 
    '1': { back: '-', lay: '-' }, 
    'X': { back: '-', lay: '-' }, 
    '2': { back: '-', lay: '-' } 
  };
  
  // Check if match has runners (common in cricket API)
  if (match.runners && Array.isArray(match.runners) && match.runners.length >= 2) {
    try {
      // First runner (home team)
      const runner1 = match.runners[0];
      if (runner1 && runner1.ex) {
        if (runner1.ex.b && runner1.ex.b.length > 0) {
          const backPrice = parseFloat(runner1.ex.b[0].p);
          if (!isNaN(backPrice)) {
            defaultOdds['1'].back = backPrice.toFixed(2);
          }
        }
        if (runner1.ex.l && runner1.ex.l.length > 0) {
          const layPrice = parseFloat(runner1.ex.l[0].p);
          if (!isNaN(layPrice)) {
            defaultOdds['1'].lay = layPrice.toFixed(2);
          }
        }
      }
      
      // Second runner (away team)
      const runner2 = match.runners[1];
      if (runner2 && runner2.ex) {
        if (runner2.ex.b && runner2.ex.b.length > 0) {
          const backPrice = parseFloat(runner2.ex.b[0].p);
          if (!isNaN(backPrice)) {
            defaultOdds['2'].back = backPrice.toFixed(2);
          }
        }
        if (runner2.ex.l && runner2.ex.l.length > 0) {
          const layPrice = parseFloat(runner2.ex.l[0].p);
          if (!isNaN(layPrice)) {
            defaultOdds['2'].lay = layPrice.toFixed(2);
          }
        }
      }
    } catch (e) {
      console.warn('Error extracting odds from runners:', e);
    }
  }
  
  return defaultOdds;
};

// Helper to group matches by tournament/league name
const groupMatchesByLeague = (matches) => {
  const groups = {};
  matches.forEach(match => {
    // Use match.matchName or fallback to 'Other'
    const league = match.matchName || 'Other';
    if (!groups[league]) groups[league] = [];
    groups[league].push(match);
  });
  return groups;
};

const GroupHeader = styled.div`
  background: #0a223a;
  color: #fff;
  font-weight: bold;
  font-size: 22px;
  text-align: center;
  padding: 12px 0 6px 0;
  border-top: 3px solid #ffd700;
  border-bottom: 0;
  margin-top: 18px;
  border-radius: 8px 8px 0 0;
  letter-spacing: 0.5px;
  @media (max-width: 576px) {
    font-size: 16px;
    padding: 8px 0 4px 0;
    margin-top: 12px;
    border-radius: 6px 6px 0 0;
  }
`;

const MatchRow = styled.div`
  text-align: center;
  padding: 18px 0 0 0;
  background: #fff;
  font-size: 20px;
  font-weight: 400;
  @media (max-width: 576px) {
    font-size: 15px;
    padding: 12px 0 0 0;
  }
`;

const MatchSubRow = styled.div`
  text-align: center;
  color: #1976f6;
  font-size: 20px;
  font-weight: 400;
  cursor: pointer;
  margin-bottom: 2px;
  &:hover { text-decoration: underline; }
  @media (max-width: 576px) {
    font-size: 15px;
    margin-bottom: 1px;
  }
`;

const TVRow = styled.div`
  text-align: center;
  color: #1976f6;
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 18px;
  @media (max-width: 576px) {
    font-size: 12px;
    margin-bottom: 10px;
  }
`;

const MatchList = ({ title, matches = [] }) => {
   const socket = io(`${process.env.REACT_APP_BASE_URL}`);

  const [leagues, setLeagues] = useState([]);
  const navigate = useNavigate();
    console.log(leagues);
  // Handle odds click
  const handleOddsClick = (e, match, oddsType, isBack) => {
    e.stopPropagation(); // Prevent triggering the match click
    const oddsValue = isBack ? match.odds[oddsType].back : match.odds[oddsType].lay;
    console.log(`Clicked on ${oddsType} ${isBack ? 'back' : 'lay'} odds for match: ${match.matchName}, value: ${oddsValue}`);
    // Add your betting logic here
    alert(`Selected ${oddsType} ${isBack ? 'back' : 'lay'} odds (${oddsValue}) for ${match.matchName}`);
  };

  useEffect(() => {
    socket.on("updateMatches", (data) => {
      // console.log("Received data:", data); // Debugging step
      if (Array.isArray(data)) {
        // Add dummy odds to each match
        const matchesWithOdds = data.map(match => ({
          ...match,
          odds: {
            '1': {
              back: (2 + Math.random() * 2).toFixed(2),
              lay: (2.2 + Math.random() * 2).toFixed(2)
            },
            'X': {
              back: (3 + Math.random() * 2).toFixed(2),
              lay: (3.2 + Math.random() * 2).toFixed(2)
            },
            '2': {
              back: (1.8 + Math.random() * 1).toFixed(2),
              lay: (1.9 + Math.random() * 1).toFixed(2)
            }
          }
        }));
        setLeagues(matchesWithOdds);
      } else {
        console.error("Data is not an array:", data);
      }
    });

    return () => socket.off("updateMatches");
  }, []);

const handleClick = (gameid,iframeUrl,match) => {
  navigate(`/match/currmtc`, {
    state: { id: gameid ,iframeUrl:iframeUrl ,match:match}
  });
  // console.log(gameid)
};   


  // console.log("Received matches:", JSON.stringify(matches, null, 2)); // Enhanced debug log with full structure
  
  // Use actual matches data if available, otherwise use sample data
  const displayMatches = matches && matches.length > 0 ? matches : sampleMatches;
  
  // Ensure each match has an odds object with default values and a unique ID
  const safeMatches = displayMatches.map((match, index) => {
    // console.log(`Processing match ${index}:`, match); // Debug log for each match
    
    // Extract date and time from ISO string if available
    const eventDate = match.event_date || match.date;
    const formattedDate = formatDate(eventDate);
    const formattedTime = formatTime(eventDate);
    
    // Extract match name with index for context
    const matchName = extractMatchName(match) || `Cricket Match ${index + 1}`;
    
    // Extract odds from runners if available
    const extractedOdds = extractOddsFromRunners(match);
    
    // Get team names for display in odds columns
    let team1Name = '';
    let team2Name = '';
    
    if (match.runnerNames && Array.isArray(match.runnerNames) && match.runnerNames.length >= 2) {
      team1Name = match.runnerNames[0].RN;
      team2Name = match.runnerNames[1].RN;
    } else if (matchName.includes('vs')) {
      const teams = matchName.split('vs').map(t => t.trim());
      team1Name = teams[0];
      team2Name = teams[1];
    }
    
    console.log(leagues);

    // Create a safe match object with all required properties
    return {
      id: match.id || match.match_id || match.matchId || `match-${index}`,
      title: matchName,
      date: formattedDate,
      time: formattedTime,
      isLive: match.isLive || match.inplay || false,
      hasStream: match.hasStream || match.has_stream || false,
      odds: extractedOdds,
      team1: team1Name,
      team2: team2Name
    };
  });

  // console.log("Safe matches:", safeMatches); // Debug log to see processed data

  return (
    <MatchListContainer>
      <Header />
      {leagues.length === 0 ? (
        <NoMatchesMessage>
          <FaRegClock />
          <p>No matches available at the moment.</p>
          <p>Please check back later or try another sport.</p>
        </NoMatchesMessage>
      ) : (
        // Group and render matches by league/tournament
        Object.entries(groupMatchesByLeague(leagues)).map(([league, matches]) => (
          <div key={league}>
            <GroupHeader>{league}</GroupHeader>
            {matches.map((match, idx) => (
              <div key={match.eventId || idx}>
                <MatchRow>
                  <MatchSubRow onClick={() => handleClick(match.marketId, match.scoreIframe, match.matchName)}>
                    {match.matchDate}
                  </MatchSubRow>
                  <TVRow>BM F T V</TVRow>
                </MatchRow>
              </div>
            ))}
          </div>
        ))
      )}
    </MatchListContainer>
  );
};

export default MatchList; 






