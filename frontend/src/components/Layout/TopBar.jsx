import { AppBar, Toolbar, IconButton, Typography, Box, Menu, MenuItem, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import { Link as RouterLink } from 'react-router-dom';

const TopBar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar position="fixed" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
          EDLP Tenis
        </Typography>
        <Box>
          <IconButton color="inherit" onClick={handleMenu}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{user?.full_name?.[0] || 'U'}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} keepMounted>
            <MenuItem onClick={handleClose} component={RouterLink} to="/profile">
              Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>Salir</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
