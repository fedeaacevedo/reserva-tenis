import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import EventIcon from '@mui/icons-material/Event';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import LockIcon from '@mui/icons-material/Lock';
import PeopleIcon from '@mui/icons-material/People';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const drawerWidth = 240;

const navItems = (isAdmin) => [
  { label: 'Dashboard', icon: <DashboardIcon />, to: '/' },
  { label: 'Canchas', icon: <SportsTennisIcon />, to: '/courts' },
  { label: 'Disponibilidad', icon: <CalendarViewWeekIcon />, to: '/courts/availability' },
  { label: 'Reservas', icon: <EventIcon />, to: '/reservations' },
  isAdmin ? { label: 'Cierres', icon: <LockIcon />, to: '/admin/closures' } : null,
  isAdmin ? { label: 'Usuarios', icon: <PeopleIcon />, to: '/users' } : null
].filter(Boolean);

const SideNav = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const content = (
    <div>
      <Toolbar />
      <List>
        {navItems(isAdmin).map((item) => (
          <ListItemButton
            component={Link}
            to={item.to}
            key={item.to}
            selected={location.pathname === item.to}
            onClick={onClose}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        open
      >
        {content}
      </Drawer>
    </Box>
  );
};

export default SideNav;
