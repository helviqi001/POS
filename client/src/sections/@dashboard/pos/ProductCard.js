import PropTypes from 'prop-types';
// @mui
import { Box, Card, Link, Typography, Stack, IconButton } from '@mui/material';
import { useReducer, useState } from 'react';
import { styled } from '@mui/material/styles';
// utils
import AddIcon from '@mui/icons-material/Add';
// components
import Label from '../../../components/label';
import { PosReducer,INITIAL_STATE, usePos } from './posReducer';


// ----------------------------------------------------------------------

const StyledProductImg = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
});

// ----------------------------------------------------------------------

ShopProductCard.propTypes = {
  product: PropTypes.object,
};

export default function ShopProductCard({ product }) {
  const { state,dispatch} = usePos()

  const {id,idProduk,name,stock,urlImage, sellingPrice, discount } = product;
  const formattedNumber = sellingPrice.toLocaleString(undefined,{
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
  })
  const afterDisc = sellingPrice * (100 - discount) / 100;
  const formattedAfterDisc = afterDisc.toLocaleString(undefined,{
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
})

  const handleAdd=(data)=>{
    const addedData = [{...data,quantity:0}]
    dispatch({type:"ADDED" , payload:addedData})
  }
  console.log(state.product);
  return (
    <>
    <Card >
      <Box sx={{ pt: '100%', position: 'relative' }}>
      {discount > 0 && (
          <Label
            variant="filled"
            color='error'
            sx={{
              zIndex: 9,
              top: 16,
              right: 16,
              position: 'absolute',
              textTransform: 'uppercase',
            }}
          >
           Sale {discount}%
          </Label>
        )}
        <StyledProductImg alt={name} src={`http://localhost:8000/storage/${urlImage}`} />
      </Box>

      <Stack spacing={5} sx={{p:3}}>
        <Typography variant="subtitle1" >
        <Typography variant="subtitle1">
            {name}
        </Typography>
            <Typography variant='subtitle2' sx={{fontSize:13}}>
              Kode : {idProduk}
            </Typography>
            <Typography variant='subtitle2' sx={{fontSize:13}}>
              stock : {stock}
            </Typography>
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
            {discount > 0 ? (
          <Typography variant="subtitle1" sx={{display:'flex',flexDirection:'column'}}>
              <Typography
                component="span"
                variant="body1"
                sx={{
                  color: 'text.disabled',
                  textDecoration: 'line-through',
                  fontSize:13
                }}
              >
               IDR {formattedNumber && formattedNumber}
              </Typography>
              IDR {formattedAfterDisc}

          </Typography>
            ) : (
          <Typography variant="subtitle1" sx={{display:'flex',flexDirection:'column'}}>
             <Typography
                sx={{
                  height:20
                }}>
                <></>
              </Typography>
              IDR {formattedNumber}
          </Typography>
            )}
            {stock >0 ? (

            <IconButton size="large" color="inherit" onClick={()=>handleAdd(product)}>
                <AddIcon/>
            </IconButton>
            ) : (
              <Typography fontSize={12} height={0}>Tidak Tesedia</Typography>
            )}
        </Stack>
      </Stack>
    </Card>
    </>
  );
}
