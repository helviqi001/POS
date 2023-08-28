import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import { Box, List, ListItemText, Menu, MenuItem } from '@mui/material';
//
import { StyledNavItem, StyledNavItemIcon } from './styles';

// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [] , load, ...other }) {
  const [openedDropdown, setOpenedDropdown] = useState('');

  const handleOpen = (title) => {
    setOpenedDropdown(title);
  };

  const handleClose = () => {
    setOpenedDropdown('');
  };
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item) => (
          <NavItem
            handleOpen={handleOpen}
            handleClose={handleClose}
            item={item}
            currentItem={openedDropdown}
            key={item.title}
          />
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
};

function NavItem({ item, handleOpen, handleClose, currentItem, ...props }) {
  const { title, path, icon, info, menuItems } = item;
  const anchorEl = useRef(null);
  // console.log(getNavItemPath());
  return (
    <div ref={anchorEl}>
      <StyledNavItem
        onClick={() => handleOpen(title)}
        component={RouterLink}
        to={path}
        sx={{
          '&.active': {
            color: 'text.primary',
            bgcolor: 'action.selected',
            fontWeight: 'fontWeightBold',
          },
        }}
      >
        <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>

        <ListItemText disableTypography primary={title} />

        {info && info}
      </StyledNavItem>
      {menuItems && menuItems.length > 0 && (
        <NavDropdown
          anchorEl={anchorEl.current}
          open={currentItem === title}
          menuItems={menuItems}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

const NavDropdown = ({ anchorEl, onClose, menuItems, open }) => {

  return (
    <Menu
      
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      {menuItems.length > 0 && menuItems.map((item, i) => <MenuItem key={i} component={RouterLink} to={item.path}>{item.title}</MenuItem>)}
    </Menu>
  );
};