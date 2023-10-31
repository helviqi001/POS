import PropTypes from 'prop-types';
// @mui
import { Box, Card, Typography, Stack, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
// utils
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
// components
import Label from '../../../components/label';
import {  usePos } from './posReducer';


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

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;


export default function ShopProductCard({ product, add}) {
  const { state,dispatch} = usePos()
  const {id,idProduk,name,stock,urlImage, sellingPrice, discount } = product;
  const isInCart= state.product.some((item) => item.id === id)
  const formattedNumber = sellingPrice.toLocaleString('id-ID',{
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
  })
  const afterDisc = sellingPrice * (100 - discount) / 100;
  const formattedAfterDisc = afterDisc.toLocaleString('id-ID',{
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
})
const handleAddToCart = () => {
    const addedData = [{ ...product, quantity: 1,sellingPrice:afterDisc }];
    dispatch({ type: "ADDED", payload: addedData });
};

const handleRemoveFromCart = () => {
    dispatch({ type: "REMOVE", payload: id });
};
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
        <StyledProductImg alt={name} src={`${apiEndpoint}storage/${urlImage}`} />
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
            {add === 1 && (
              stock >0 ? (
               <IconButton
               size="large"
               color="inherit"
               onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
             >
               {isInCart ? <RemoveIcon /> : <AddIcon />}
             </IconButton>
              ) : (
                <Typography fontSize={12} height={0}>Tidak Tesedia</Typography>
              )
            )}
        </Stack>
      </Stack>
    </Card>
    </>
  );
}
