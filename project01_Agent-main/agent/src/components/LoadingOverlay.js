import React from 'react';
import { Backdrop, CircularProgress, Fade, Box, Typography } from '@mui/material';
import { Cached as ReloadIcon } from '@mui/icons-material';

const LoadingOverlay = ({ loading }) => {
  return (
    <Fade in={loading}>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
        open={loading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress color="primary" />
            <ReloadIcon 
              sx={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 20,
                color: '#fff'
              }} 
            />
          </Box>
          <Typography variant="body1" sx={{ color: '#fff' }}>
            Loading...
          </Typography>
        </Box>
      </Backdrop>
    </Fade>
  );
};

export default LoadingOverlay; 