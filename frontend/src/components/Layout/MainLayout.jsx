import { Box, Toolbar } from '@mui/material';
import { useState } from 'react';
import TopBar from './TopBar.jsx';
import SideNav from './SideNav.jsx';

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <TopBar onMenuClick={() => setMobileOpen(!mobileOpen)} />
      <SideNav mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
