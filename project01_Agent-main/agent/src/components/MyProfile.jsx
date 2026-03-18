import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, Paper, Typography, Avatar } from '@mui/material';
import DiamondIcon from '@mui/icons-material/Diamond';
import GroupIcon from '@mui/icons-material/Group';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';

const cardStyle = {
  background: '#85ac8f',
  color: '#fff',
  borderRadius: '20px',
  boxShadow: '0 4px 16px #0001',
  padding: { xs: '24px', sm: '24px' },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  height: { xs: '84px', sm: '84px' },
  justifyContent: 'center',
  width: '100%',
  boxSizing: 'border-box',
};

const MyProfile = () => {
  const [profileData, setProfileData] = useState({
    agentId: '',
    role: 'You are Mini Admin',
    chips: 0,
    members: 0,
    myShare: 0,
    companyShare: 0,
    matchCommission: 0,
    sessionCommission: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedAgent = JSON.parse(localStorage.getItem('agent'));
        console.log(storedAgent.id)
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/agent/${storedAgent.id}`);
        if (res.data.success) {
          const data = res.data.data;
          setProfileData({
            agentId: data.AgentNo,
            role: 'You are agent',
            chips: data.balance,
            members: 2, // update if dynamic
         
            matchCommission: data.matchComm,
            sessionCommission: data.sessComm,
          });
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };

    fetchProfile();
  }, []);
console.log(profileData)
  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, width: '100%' }}>
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ width: '100%' }}>
        <Grid item xs={6} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper sx={{ ...cardStyle, width: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: '#fff', color: '#85ac8f', mr: 1 }}>
                <BarChartIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>
                {profileData.agentId}
              </Typography>
            </Box>
            <Typography variant="body1">{profileData.role}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper sx={{ ...cardStyle, width: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <DiamondIcon sx={{ fontSize: 28, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                {profileData.chips}
              </Typography>
            </Box>
            <Typography variant="body1">Chips</Typography>
          </Paper>
        </Grid>


        <Grid item xs={6} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper sx={{ ...cardStyle, width: '100%' }}>
            <Typography variant="h6" fontWeight={700}>
              {profileData.matchCommission}%
            </Typography>
            <Typography variant="body1">Match Comm.</Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper sx={{ ...cardStyle, width: '100%' }}>
            <Typography variant="h6" fontWeight={700}>
              {profileData.sessionCommission}%
            </Typography>
            <Typography variant="body1">Session Comm.</Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper sx={{ ...cardStyle, width: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <GroupIcon sx={{ fontSize: 28, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                {profileData.members}
              </Typography>
            </Box>
            <Typography variant="body1">Total Members</Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper sx={{ ...cardStyle, width: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <InfoOutlinedIcon sx={{ fontSize: 28, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                Rules
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MyProfile;
