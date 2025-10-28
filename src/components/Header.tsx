

import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Stack, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation } from 'react-router-dom';
import './HeaderResponsive.css';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Apply', to: '/get-bike' },
  { label: 'Bikes', to: '/bikes' },
  { label: 'Ride', to: '/ride' },
  { label: 'Faqs', to: '/faqs' },
  { label: 'Contact Us', to: '/contact' },
];

function isActive(linkTo: string, location: any) {
  if (linkTo === '/') {
    return location.pathname === '/';
  }
  if (linkTo.startsWith('#')) {
    return location.hash === linkTo;
  }
  // fallback for other routes
  return location.pathname === linkTo;
}


const Header: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const location = useLocation();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(10, 10, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1.5px solid #23242a',
        boxShadow: '0 2px 24px 0 rgba(60, 60, 70, 0.08)',
      }}
    >
      <Toolbar sx={{ minHeight: 48, px: 2, height: 48 }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 1.2,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none',
              fontFamily: 'Montserrat, Roboto, Arial, sans-serif',
              fontSize: '1.1rem',
            }}
          >
            <Box component="span" sx={{ color: '#fff' }}>Sure</Box>
            <Box component="span" sx={{ color: '#00c6fb', ml: 0.5 }}>Boda</Box>
            <DirectionsBikeIcon sx={{ color: '#fff', fontSize: 22, ml: 1, mb: '-2px' }} />
          </Typography>
        </Box>
        {/* Desktop Menu */}
        <Box
          className="header-desktop-menu"
          sx={{
            flex: 1,
            display: { xs: 'none', sm: 'flex' }, // will override with CSS for custom breakpoint
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Stack direction="row" spacing={2.2} alignItems="center">
            {navLinks.map((link) => {
              const active = isActive(link.to, location);
              return (
                <Button
                  key={link.label}
                  component={Link}
                  to={link.to}
                  disableRipple
                  sx={{
                    color: active ? '#00aaff' : '#fff',
                    fontWeight: active ? 700 : 600,
                    fontFamily: 'Quicksand, Inter, Montserrat, Roboto, Arial, sans-serif',
                    fontSize: '0.78rem',
                    letterSpacing: active ? 0.3 : 0.2,
                    px: 0.7,
                    borderRadius: 1,
                    background: 'none',
                    boxShadow: 'none',
                    minWidth: 0,
                    transition: 'color 0.18s, background 0.18s, font-weight 0.18s',
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                    textShadow: '0 1px 0 rgba(0,0,0,0.08)',
                    borderBottom: active ? '2px solid #00aaff' : '2px solid transparent',
                    '&:hover': {
                      background: 'rgba(0, 120, 255, 0.08)',
                      color: '#00aaff',
                      fontWeight: 700,
                      letterSpacing: 0.3,
                    },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                overflow: 'hidden',
                ml: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#18191c',
              }}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Kenya.svg"
                alt="Kenyan flag"
                style={{ width: 16, height: 16, objectFit: 'cover', borderRadius: '50%' }}
              />
            </Box>
          </Stack>
        </Box>
        {/* Mobile Hamburger */}
        <Box className="header-mobile-menu" sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ ml: 1 }}
          >
            <MenuIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
      </Toolbar>
      {/* Drawer for mobile menu */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#18191c',
            color: '#fff',
            width: 220,
            pt: 0,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, pt: 1.5, pb: 0.5 }}>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#fff', p: 0.5 }} aria-label="close drawer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </IconButton>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#18191c',
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Kenya.svg"
              alt="Kenyan flag"
              style={{ width: 16, height: 16, objectFit: 'cover', borderRadius: '50%' }}
            />
          </Box>
        </Box>
        <List>
          {navLinks.map((link) => {
            const active = isActive(link.to, location);
            return (
              <ListItem key={link.label} disablePadding>
                <ListItemButton
                  component={Link}
                  to={link.to}
                  sx={{
                    color: active ? '#00aaff' : '#fff',
                    fontWeight: active ? 700 : 600,
                    fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif',
                    fontSize: '1rem',
                    letterSpacing: active ? 0.3 : 0.2,
                    borderBottom: active ? '2px solid #00aaff' : '2px solid transparent',
                    '&:hover': {
                      color: '#00aaff',
                    },
                  }}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={link.label.toUpperCase()} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Header;
