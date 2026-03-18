import React,{useState,useEffect} from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  Menu,
  MenuItem,
  Button,
  Tooltip,
  Divider,

} from '@mui/material';
import {

  Person as PersonIcon,
  SportsEsports as GamesIcon,
  AccountBalance as LedgerIcon,
  Payment as CashIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  Home as HomeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
// import AgentDetails from './AgentDetails';
// import GamesDetails from './GamesDetails';
import LoadingOverlay from './LoadingOverlay';
import ClientPage from '../ClientMasterpage/clientPage';
import CreateClient from '../ClientMasterpage/createClient';
import UpdateLimit from '../ClientMasterpage/updatLimit';
// import finishGames from '../sportBatting/finishGames';
import CasinoGames from '../sportBatting/casinoGames';
import ClientLenden from '../sportBatting/clientlenden';
import ClientTransaction from '../clientTransaction/clienttransction'; 
import ProfitLoss from '../Ledger/ProfitLoss';
import MyLedger from '../Ledger/MyLedger';
import ClientLedger from '../Ledger/ClientLedger';
import ChangePassword from '../PasswordChange/passodchange';
import MyProfile from './MyProfile';
import Rule from '../Ledger/Rules';
import CreateSubUser from '../ClientMasterpage/createsubuser';
import AccountStatement from '../AccountStatement/AccountStatement'
import { 
  SportDetail, 
  SportMatchPosition, 
  SportAgentCommission, 
  SportPlusMinus, 
  SportMatchBets, 
  SportSessionBets, 
  SportCompletedFancies, 
  SportRejectedBets ,
  FinishGames,
  SportMatchPosition2, 
  SportAgentCommission2, 
  SportPlusMinus2, 
  SportMatchBets2, 
  SportSessionBets2, 
  SportCompletedFancies2, 
  SportRejectedBets2, 
} from '../sportBatting';
const drawerWidth = 240;
const miniDrawerWidth = 64;

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#8FB3A6',
  color: 'white',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const DashboardHome = () => {
  const cards = [
    { title: 'My Profile', path: '/profile' },
    { title: 'Agent Details', path: '/client_create' },
    { title: "Game's Details", path: '/active-details' },
    { title: 'Cash Transaction', path: '/debit-credit' },
    { title: 'Ledger Details', path: '/my-ledger' },
    { title: 'Active Events', path: '/active-details' },
    { title: 'Rules', path: '/rules' },
  ];

  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
         <Grid container direction="column" spacing={2}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.title}>
            <StyledCard 
              onClick={() => navigate(card.path)} 
              sx={{ 
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CardContent 
                className="css-1lt5qva-MuiCardContent-root"
                sx={{ 
                  padding: '15px'
                }}
              >
                <Typography 
                  variant="h6" 
                  component="div"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    textAlign: 'center'
                  }}
                >
                  {card.title}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

const menuItems = [
  {
    text: 'Dashboard',
    icon: <HomeIcon />,
    path: '/',
  },
  {
    text: 'Agent Details',
    icon: <PersonIcon />,
    children: [
      { text: 'Client master', path: '/client_create' },
    ],
  },
  {
    text: 'Sports-Betting',
    icon: <GamesIcon />,
    children: [
      { text: 'Active Details', path: '/active-details' },
      { text: 'Finished Games', path: '/finishGames' },
      { text: 'Casino Details', path: '/casino-details' },
      { text: 'Commission Lenden', path: '/commission-lenden' },
    ],
  },
  {
    text: 'Ledger',
    icon: <LedgerIcon />,
    children: [
      // { text: 'Profit/Loss', path: '/profit-loss' },
      { text: 'My Ledger', path: '/my-ledger' }, 
      { text: 'Client Ledger', path: '/client-ledger' },
    ],
  },
  {
    text: 'Cash Transaction',
    icon: <CashIcon />,
    children: [
      { text: 'Client', path: '/debit-credit' },
    ],
  },
  {
    text: 'Reports',
    icon: <ReportsIcon />,
    children: [
      { text: 'Login Report', path: '/' },
      { text: 'Mobile App Report', path: '/' },
      { text: 'Secure Code Report', path: '/' },
    ],
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    children: [
      { text: 'Change Password', path: '/change-password' },
      { text: 'Logout', path: '/login' },
   
    ],
  },
  // { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Dashboard = ({ handleLogout }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openMenus, setOpenMenus] = React.useState({});
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const storedAgent = JSON.parse(localStorage.getItem('agent'));


  const [news, setNews] = useState([{content:"Get Ready for Action - Welcome to 98FastBet!"}]);
  
    useEffect(() => {
      axios.get(`${process.env.REACT_APP_BASE_URL}/api/platform/news`)
        .then((response) => {
          if(response.data.length > 0){
            setNews(response.data)
          }
        })
        .catch((error) => console.error("Error fetching news:", error));
    }, []);


  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleMenuClick = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    navigate('/change-password');
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    if (path === '/login') {
      handleLogout();
    } else {
      setLoading(true);
      setMobileOpen(false);
      setTimeout(() => {
        navigate(path);
        setLoading(false);
      }, 1100);
    }
  };

  const renderMenuItem = (item, index) => {
    if (item.children) {
      return (
        <div key={item.text}>
          <Tooltip title={!sidebarOpen ? item.text : ''} placement="right">
            <ListItem
              button
              onClick={() => handleMenuClick(item.text)}
              sx={{
                justifyContent: 'center',
                px: 2,
                minHeight: 48,
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: '#8FB3A6', 
                  minWidth: 0, 
                  mr: sidebarOpen ? 2 : 'auto', 
                  justifyContent: 'center' 
                }}
              >
                {item.icon}
              </ListItemIcon>
              {sidebarOpen && (
                <>
                  <ListItemText primary={item.text} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {openMenus[item.text] ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                </>
              )}
            </ListItem>
          </Tooltip>
          <Collapse in={openMenus[item.text] && sidebarOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => (
                <Tooltip title={!sidebarOpen ? child.text : ''} placement="right" key={child.text}>
                  <ListItem
                    button
                    onClick={() => handleNavigation(child.path)}
                    selected={location.pathname === child.path}
                    sx={{
                      pl: sidebarOpen ? 6 : 2,
                      minHeight: 40,
                      justifyContent: 'center',
                      background: location.pathname === child.path ? '#e0f2f1' : 'transparent',
                    }}
                  >
                    {sidebarOpen ? (
                      <ListItemText primary={child.text} />
                    ) : (
                      <ListItemIcon sx={{ minWidth: 0, color: '#8FB3A6' }}>
                        {item.icon}
                      </ListItemIcon>
                    )}
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          </Collapse>
        </div>
      );
    }

    return (
      <Tooltip title={!sidebarOpen ? item.text : ''} placement="right" key={item.text}>
        <ListItem
          button
          onClick={() => handleNavigation(item.path)}
          selected={location.pathname === item.path}
          sx={{
            justifyContent: 'center',
            px: 2,
            minHeight: 48,
          }}
        >
          <ListItemIcon 
            sx={{ 
              color: location.pathname === item.path ? '#8FB3A6' : 'inherit',
              minWidth: 0,
              mr: sidebarOpen ? 2 : 'auto',
              justifyContent: 'center'
            }}
          >
            {item.icon}
          </ListItemIcon>
          {sidebarOpen && <ListItemText primary={item.text} />}
        </ListItem>
      </Tooltip>
    );
  };

  const drawer = (
    <div>
      <Toolbar sx={{ minHeight: 64, px: [1], display: 'flex', alignItems: 'center' ,backgroundColor:'#8FB3A6'}}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handleSidebarToggle}
            sx={{ color: '#666' }}
          >
            <MenuIcon />
          </IconButton>
          {sidebarOpen && (
            <Typography variant="h6" noWrap component="div" sx={{ color: '#666' }}>
              {storedAgent.name}
            </Typography>
          )}
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <LoadingOverlay loading={loading} />
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          color: 'black',
          width: { 
            xs: '100%',
            sm: `calc(100% - ${sidebarOpen ? drawerWidth : miniDrawerWidth}px)` 
          },
          ml: { 
            xs: 0,
            sm: `${sidebarOpen ? drawerWidth : miniDrawerWidth}px` 
          },
          transition: 'width 0.3s, margin 0.3s',
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          minHeight: { xs: 56, sm: 64 },
          color: 'black',
          px: { xs: 1, sm: 2 }
        }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' } 
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ width: { xs: 'auto', sm: 240 } }} />
          <Box>
            <Button
              color="inherit"
              onClick={handleProfileMenuOpen}
              endIcon={<ExpandMore />}
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
                {storedAgent.name}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>Password Change</MenuItem>
              <MenuItem onClick={() => handleNavigation('/login')}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
        <div
          style={{
            width: '100%',
            background: '#6C757D',
            color: 'white',
            overflow: 'hidden',
            height: 28,
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <style>
            {`
              @keyframes scrollNews {
                0% {
                  transform: translateX(100%);
                }
                100% {
                  transform: translateX(-100%);
                }
              }
              .scrolling-text {
                white-space: nowrap;
                display: inline-block;
                position: absolute;
                animation: scrollNews 20s linear infinite;
                padding-left: 100%;
              }
              .scrolling-text:hover {
                animation-play-state: paused;
              }
            `}
          </style>
          <div className="scrolling-text">
          {news[0].content}
          </div>
        </div>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: '#fff',
            color: '#222',
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: sidebarOpen ? drawerWidth : miniDrawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? drawerWidth : miniDrawerWidth,
            background: '#fff',
            color: '#222',
            transition: 'width 0.3s',
            overflowX: 'hidden',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        className="css-6md5nc"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: {
            xs: '100%',
            sm: `calc(100% - ${sidebarOpen ? drawerWidth : miniDrawerWidth}px)`
          },
          mt: { xs: '90px', sm: '90px' },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          transition: 'width 0.3s',
          '@media (min-width: 0px)': {
            padding: '2px',
            width: '100%',
            marginTop: '87px'
          }
        }}
      >
        <Routes>
          <Route path="/my-ledger" element={<MyLedger/>} />
          <Route path="/" element={<DashboardHome />} />
          <Route path="/client_create" element={<ClientPage />} />
  
          <Route path="/create_subuser" element={<CreateSubUser />} />
         
          <Route path="/casino-details" element={<CasinoGames />}/>
          <Route path="/commission-lenden" element={<ClientLenden/>} />
          <Route path="/profit-loss" element={<ProfitLoss/>} />
          <Route path="/client-ledger" element={<ClientLedger/>} />
          <Route path="/debit-credit" element={<ClientTransaction/>} />
         
          
          {/* <Route path="/login-report" element={<Typography>Login Report</Typography>} />
          <Route path="/mobile-app-report" element={<Typography>Mobile App Report</Typography>} />
          <Route path="/secure-code-report" element={<Typography>Secure Code Report</Typography>} /> */}
          <Route path="/reports" element={<Typography>Reports</Typography>} />
          <Route path="/change-password" element={<ChangePassword/>} />
          <Route path="/create" element={<CreateClient />} />
          <Route path='/updatLimit' element={<UpdateLimit />} />
          <Route path='/active-details' element={<SportDetail />} />
          <Route path='/sportdetail' element={<SportDetail />} />
          <Route path='/finishGames' element={<FinishGames />}/>
          <Route path='/rules' element={<Rule />}/>

          
          {/* New sport detail pages */}
          <Route path='/sport-match-position/:sportId' element={<SportMatchPosition />} />
          <Route path='/sport-agent-commission/:sportId' element={<SportAgentCommission />} />
          <Route path='/sport-plus-minus/:sportId' element={<SportPlusMinus />} />
          <Route path='/sport-match-bets/:sportId' element={<SportMatchBets />} />
          <Route path='/sport-session-bets/:sportId' element={<SportSessionBets />} />
          <Route path='/sport-completed-fancies/:sportId' element={<SportCompletedFancies />} />
          <Route path='/sport-rejected-bets/:sportId' element={<SportRejectedBets />} />
          <Route path='/profile' element={<MyProfile />} />


          <Route path='/sport-match-position2/:sportId' element={<SportMatchPosition2 />} />
          <Route path='/sport-agent-commission2/:sportId' element={<SportAgentCommission2 />} />
          <Route path='/sport-plus-minus2/:sportId' element={<SportPlusMinus2 />} />
          <Route path='/sport-match-bets2/:sportId' element={<SportMatchBets2 />} />
          <Route path='/sport-session-bets2/:sportId' element={<SportSessionBets2 />} />
          <Route path='/sport-completed-fancies2/:sportId' element={<SportCompletedFancies2 />} />
          <Route path='/sport-rejected-bets2/:sportId' element={<SportRejectedBets2 />} />
          
          <Route path='/accountStatement' element={<AccountStatement/>} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard; 
