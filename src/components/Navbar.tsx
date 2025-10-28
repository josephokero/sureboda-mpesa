import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navLinks = (
    <List sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
      {['Build a Bike', 'About', 'Features', 'Contact'].map((text) => (
        <ListItem key={text} sx={{ justifyContent: 'center' }}>
          <Button color="inherit" sx={{ '&:hover': { color: theme.palette.secondary.main } }}>
            <ListItemText primary={text} />
          </Button>
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      <AppBar position="absolute" sx={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsBikeIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              SUREBODA
            </Typography>
          </Box>
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              {navLinks}
              <Button variant="contained" color="primary" sx={{ borderRadius: 99, px: 4 }}>
                Get Started
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{ '& .MuiDrawer-paper': { background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', color: '#fff' } }}
      >
        <Box
          sx={{ width: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}
          role="presentation"
          onClick={handleDrawerToggle}
          onKeyDown={handleDrawerToggle}
        >
          {navLinks}
          <Button variant="contained" color="primary" sx={{ borderRadius: 99, px: 4, mt: 2 }}>
            Get Started
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;