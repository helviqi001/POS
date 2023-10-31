import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
// @mui
import { Container, Stack, Typography } from '@mui/material';
// components
import axios from 'axios';
import Cookies from 'universal-cookie';
import { ProductSort, ProductList, ProductCartWidget, ProductFilterSidebar } from '../sections/@dashboard/sale';
// mock
import PRODUCTS from '../_mock/products';
// ----------------------------------------------------------------------
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export default function SalesPage() {
  const [openFilter, setOpenFilter] = useState(false);

  const [productList , setProduct] = useState([])

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  

  const cookies = new Cookies()

  const cookie = cookies.get("Authorization");
  useEffect(()=>{
    const getData=async()=>{
      axios.get(`${apiEndpoint}api/products?relations=category,unit,supplier`,{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        setProduct(response.data.data)
      })
    }
    getData()
  },[])

  console.log(productList);
  return (
    <>
      <Helmet>
        <title> Dashboard: Products | Minimal UI </title>
      </Helmet>

      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
         Our Products
        </Typography>

        <Stack direction="row" flexWrap="wrap-reverse" alignItems="center" justifyContent="flex-end" sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
            <ProductFilterSidebar
              openFilter={openFilter}
              onOpenFilter={handleOpenFilter}
              onCloseFilter={handleCloseFilter}
            />
            <ProductSort />
          </Stack>
        </Stack>

        <ProductList products={PRODUCTS} />
        <ProductCartWidget />
      </Container>
    </>
  );
}
