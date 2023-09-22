import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import PropTypes from 'prop-types';
import { NavLink as RouterLink } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
// @mui
import { Box, Collapse, List, ListItemText, Menu, MenuItem } from '@mui/material';
//
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NavConfig from '../../layouts/dashboard/nav/config';
import { StyledNavItem, StyledNavItemIcon } from './styles';

// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({load, ...other }) {
  const [openedDropdown, setOpenedDropdown] = useState('');
  // const [navConfig, setNavConfig] = useState([]);
  const navConfig = NavConfig()
  const handleOpen = (title) => {
    setOpenedDropdown(title);
  };

  const handleClose = () => {
    setOpenedDropdown('');
  };
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {navConfig.map((item) => (
          <NavItem
            handleOpen={handleOpen}
            handleClose={handleClose}
            item={item}
            currentItem={openedDropdown}
            key={item.id}
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

function NavItem({ item, handleOpen, handleClose, currentItem, ...props}) {
  const { name, path, icon, info, menuitem } = item;
  const [checked, setChecked] = React.useState(false);

  const handleChange = () => {
    setChecked(!checked);
  };
  return (
    <div>
      <StyledNavItem
        onClick={() => handleChange()}
        sx={{
          '&.active': {
            color: 'text.primary',
            bgcolor: 'action.selected',
            fontWeight: 'fontWeightBold',
          },
        }}
      >
        <StyledNavItemIcon><i className={`fa-solid ${icon} fa-xl`}/></StyledNavItemIcon>

        <ListItemText disableTypography primary={name} sx={{ fontSize:16 }}/>
        {checked ? <ExpandMoreIcon/> : <ExpandLessIcon/>}
      </StyledNavItem>
      <Collapse in={checked} timeout={'auto'} unmountOnExit>
        <>

           {menuitem.map((p)=>(
              <StyledNavItem
              component={RouterLink}
              to={p.url}
              sx={{
                '&.active': {
                  color: 'text.primary',
                  bgcolor: 'action.selected',
                  fontWeight: 'fontWeightBold',
                },
              }}
              >
              <StyledNavItemIcon><i className={`fa-solid ${p.icon} fa-lg`}/></StyledNavItemIcon>

                  <ListItemText disableTypography primary={p.name} />

              </StyledNavItem>
            ))}
        </>
      </Collapse>
    </div>
  );
}