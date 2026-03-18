import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './sportDetail.css';
import styled from "styled-components";
import { useProfile } from '../context/ProfileContext';
import axios from 'axios';
const SportMatchPosition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const matchCode = location.state?.code || 'N/A';
  const matchName = location.state?.name || 'Unknown Match';
  const { profile} = useProfile();
  
  // Function to split match name into two teams
  const splitMatchName = (name) => {
    if (!name || name === 'Unknown Match') {
      return ['Team A', 'Team B'];
    }
    
    // Common separators: vs, v, VS, V, -, /, |
    const separators = [/\s+vs\s+/i, /\s+v\s+/i, /\s+-\s+/, /\s+\/\s+/, /\s+\|\s+/];
    
    for (const separator of separators) {
      const parts = name.split(separator);
      if (parts.length >= 2) {
        // Clean up team names - remove extra spaces and common suffixes like (ODI), (T20), etc.
        const team1 = parts[0].trim().replace(/\s*\([^)]*\)\s*$/, '').trim().toUpperCase();
        const team2 = parts.slice(1).join(' ').trim().replace(/\s*\([^)]*\)\s*$/, '').trim().toUpperCase();
        if (team1 && team2) {
          return [team1, team2];
        }
      }
    }
    
    // If no separator found, try to split by common patterns
    // For names like "Sri Lanka U19 v Ireland U19 (ODI)"
    const match = name.match(/^(.+?)\s+(?:vs|v|VS|V|-|\/)\s+(.+?)(?:\s*\([^)]*\))?$/i);
    if (match && match[1] && match[2]) {
      return [match[1].trim(), match[2].trim()];
    }
    
    // Fallback: return as single team or split by space
    return [name, 'Team B'];
  };

  // Split match name into teams
  const teams = useMemo(() => splitMatchName(matchName), [matchName]);

  // State for match position data
  const [matchPositionData, setMatchPositionData] = useState([
    { team: teams[0] || 'Team A', plusMinus: 0 },
    { team: teams[1] || 'Team B', plusMinus: 0 },
  ]);

  // State for session position data
  const [sessionPositionData, setSessionPositionData] = useState([]);

  const handleBackClick = () => {
    navigate('/sportdetail');
  };

  const parentId = profile?.userId;
  
  // Fetch match position data
  useEffect(() => {
    const fetchMatchPosition = async () => {
      if (!parentId || !matchName) {
        // Reset to default when no parentId or matchName
        setMatchPositionData([
          { team: teams[0] || 'Team A', plusMinus: 0 },
          { team: teams[1] || 'Team B', plusMinus: 0 },
        ]);
        setSessionPositionData([]);
        return;
      }
      
      try {
        console.log('Fetching match position - parentId:', parentId, 'matchName:', matchName);
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/getcurrentbookmakerspostionbets/${parentId}`,
          { params: { matchName } }
        );
        
        console.log('API Response:', res.data);
        
        // Parse match position values - handle both positive and negative numbers
        const teamAProfit = parseFloat(res.data.teamAProfit) || 0;
        const teamBProfit = parseFloat(res.data.teamBProfit) || 0;
        
        console.log('Parsed values - teamAProfit:', teamAProfit, 'teamBProfit:', teamBProfit);
        
        // Update match position data with real values (both + and - are summed correctly)
        setMatchPositionData([
          { team: teams[0] || 'Team A', plusMinus: teamAProfit },
          { team: teams[1] || 'Team B', plusMinus: teamBProfit },
        ]);

        // Update session position data with real data from API
        const sessionData = res.data.sessionData || [];
        console.log('Session data:', sessionData);
        setSessionPositionData(sessionData);
      } catch (error) {
        console.error('Error fetching match position:', error);
        // Keep team names but reset profits on error
        setMatchPositionData([
          { team: teams[0] || 'Team A', plusMinus: 0 },
          { team: teams[1] || 'Team B', plusMinus: 0 },
        ]);
        // Reset session data on error
        setSessionPositionData([]);
      }
    };

    fetchMatchPosition();
  }, [parentId, matchName, teams]);

  return (
    <PageContainer>
      <HeaderRow>
        <Title>Match and Session Position</Title>
        <BackButton onClick={handleBackClick}>Back</BackButton>
      </HeaderRow>

      {/* <MatchMeta>
        <MetaItem>
          <MetaLabel>Code</MetaLabel>
          <MetaValue>{matchCode}</MetaValue>
        </MetaItem>
        <MetaItem>
          <MetaLabel>Match</MetaLabel>
          <MetaValue>{matchName}</MetaValue>
        </MetaItem>
      </MatchMeta> */}

      <SectionCard>
        <SectionTitle>Match Position</SectionTitle>
        <Table>
          <thead>
            <tr>
              <HeaderCell align="left">Team</HeaderCell>
              <HeaderCell align="right">Plus/Minus</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {matchPositionData.map((row, index) => (
              <tr key={`${row.team}-${index}`}>
                <Cell align="left">{row.team}</Cell>
                <Cell align="right">
                  <PlusMinus value={row.plusMinus}>
                    {row.plusMinus === 0 ? '0' : parseFloat(row.plusMinus).toFixed(2)}
                  </PlusMinus>
                </Cell>
              </tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Session Position</SectionTitle>
        <Table>
          <thead>
            <tr>
              <HeaderCell align="left">Session</HeaderCell>
              <HeaderCell align="right">Plus/Minus</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {sessionPositionData.length > 0 ? (
              sessionPositionData.map((row, index) => (
                <tr key={`${row.session}-${index}`}>
                  <Cell align="left">{row.session}</Cell>
                  <Cell align="right">
                    <PlusMinus value={row.plusMinus}>
                      {row.plusMinus === 0 ? '0' : parseFloat(row.plusMinus).toFixed(2)}
                    </PlusMinus>
                  </Cell>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', padding: '12px 14px', color: '#999', fontStyle: 'italic' }}>
                  No session data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </SectionCard>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: 7px 2px;
  background: #f8f8f8;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 8px;
  }

  @media (max-width: 480px) {
    padding: 8px 4px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #2d2d2d;
  margin: 0;
  flex: 1;
  min-width: 200px;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    min-width: auto;
  }
`;

const BackButton = styled.button`
  background: #0c5ac4;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;

  &:hover {
    background: #0a4aa4;
  }

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const MatchMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 14px;
  }

  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 12px;
  }
`;

const MetaItem = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e5;
  padding: 10px 12px;
  border-radius: 6px;

  @media (max-width: 480px) {
    padding: 8px 10px;
  }
`;

const MetaLabel = styled.div`
  font-size: 12px;
  color: #7a7a7a;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.4px;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const MetaValue = styled.div`
  font-size: 14px;
  color: #2f2f2f;
  font-weight: 600;
  word-break: break-word;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const SectionCard = styled.div`
  background: #ffffff;
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  margin-bottom: 18px;
  overflow: hidden;
  width: 100%;

  @media (max-width: 480px) {
    margin-bottom: 14px;
    border-radius: 4px;
  }
`;

const SectionTitle = styled.div`
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  color: #595959;
  border-bottom: 1px solid #ededed;
  background: #f7f7f7;

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  display: table;

  thead tr {
    background: #90C695;
  }

  tbody tr {
    border-bottom: 1px solid #e5e5e5;
    background: #ffffff;
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const HeaderCell = styled.th`
  padding: 12px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  text-align: ${(p) => p.align || 'left'};
  border-bottom: none;

  @media (max-width: 480px) {
    padding: 10px 8px;
    font-size: 11px;
  }
`;

const Cell = styled.td`
  padding: 12px 14px;
  font-size: 13px;
  color: #2f2f2f;
  text-align: ${(p) => p.align || 'left'};
  word-break: break-word;

  @media (max-width: 480px) {
    padding: 10px 8px;
    font-size: 12px;
  }
`;

const PlusMinus = styled.span`
  display: inline-block;
  min-width: 50px;
  text-align: center;
  font-weight: 700;
  color: ${(p) => {
    if (p.value < 0) return '#d00000';
    if (p.value > 0) return '#0c5ac4';
    return '#2f2f2f';
  }};

  @media (max-width: 480px) {
    min-width: 40px;
    font-size: 12px;
  }
`;

export default SportMatchPosition; 
