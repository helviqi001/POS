import PropTypes from 'prop-types';
import { forwardRef, useContext, useState } from 'react';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment, Snackbar, Box, Button } from '@mui/material';
// component
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

// ----------------------------------------------------------------------

ProductListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
};

const Alert = forwardRef((props, ref) =>{
  return <MuiAlert elevation={6} ref={ref} variant="standard" {...props} />;
});
export default function ProductListToolbar({selected,setId, filterName, onFilterName,handleClick }) {
  const handle=()=>{
    handleClick()
    setId(selected)
  }
  return (
    <>
    
    <StyledRoot
      sx={{
        ...(selected.length > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {selected.length > 0 ? (
        <Typography component="div" variant="subtitle1">
          {selected.length} selected
        </Typography>
      ) : (
        <StyledSearch
          value={filterName}
          onChange={onFilterName}
          placeholder="Search..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          }
        />
      )}

      {selected.length > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={handle}>
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
        </Tooltip>
      ) : (
        <></>
      )}
    </StyledRoot>
 
    </>
  );
}
