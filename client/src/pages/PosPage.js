import { Helmet } from 'react-helmet-async';
import { useEffect, useReducer, useState } from 'react';
// @mui
import { Box, Button, Container, Dialog, DialogContent, Stack, Typography } from '@mui/material';
// components
import axios from 'axios';
import Cookies from 'universal-cookie';
import { PosReducer,INITIAL_STATE, usePos } from '../sections/@dashboard/pos/posReducer';
import { ProductSort, ProductList, ProductCartWidget, ProductFilterSidebar } from '../sections/@dashboard/pos';
// mock
import PRODUCTS from '../_mock/products';
// ----------------------------------------------------------------------

export default function PosPage() {
  const [openFilter, setOpenFilter] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const [productList , setProduct] = useState([])
  const { state, dispatch } = usePos();

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    dispatch({type:"RESET_STATE"})
    setOpenModal(false);
    
  };
  const cookies = new Cookies()

  const cookie = cookies.get("Authorization");
  useEffect(()=>{
    const getData=async()=>{
      axios.get("http://localhost:8000/api/products?relations=category,unit,supplier",{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        const serverProductList = response.data.data.map((row) => ({
          ...row,
          unitName: row.unit.shortname,
          supplierName: row.supplier.name,
          categoryType: row.category.itemType,
        }))
        const localStorageProductList = JSON.parse(localStorage.getItem("itemsAdded")) || [];

        // Memeriksa dan menghapus produk yang tidak ada dalam productList
        const updatedLocalStorageProductList = localStorageProductList.filter((localStorageProduct) => {
          return serverProductList.some((serverProduct) => {
            return serverProduct.id === localStorageProduct.id;
          });
        });

        // Menyimpan produk yang sudah diperbarui ke localStorage
        localStorage.setItem("itemsAdded", JSON.stringify(updatedLocalStorageProductList));

        // Set productList dengan data produk yang sudah diperbarui
        setProduct(serverProductList)
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

        <ProductList products={productList} />
        <ProductCartWidget openModal={openModal} handleCloseModal={handleCloseModal} handleOpenModal={handleOpenModal}/>
      </Container>
    </>
  );
}
