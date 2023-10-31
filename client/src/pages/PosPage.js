import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
// @mui
import { Container, Stack, Typography } from '@mui/material';
// components
import axios from 'axios';
import Cookies from 'universal-cookie';
import {  usePos } from '../sections/@dashboard/pos/posReducer';
import { ProductList, ProductCartWidget, ProductFilterSidebar } from '../sections/@dashboard/pos';
// ----------------------------------------------------------------------

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export default function PosPage() {
  const {menu,item} = useParams()

  const setting = JSON.parse(localStorage.getItem('setting'))

  const Privilages = JSON.parse(localStorage.getItem('privilage'))

  const [openFilter, setOpenFilter] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  
  const [loading, setLoading] = useState(true);
  
  const [productList , setProduct] = useState([])
  
  const { dispatch } = usePos();
  
  const cookies = new Cookies()

  const cookie = cookies.get("Authorization");

  const [priv,setPriv] = useState({
    add:0,
  })

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
    setOpenModal(false);
    
  };

  const Privilage = ()=>{
    let menuItem = []
    const menuGroup = Privilages.filter((m)=>m.id === Number(menu))
    menuGroup.forEach(e => {
       menuItem = e.menuitem.filter((i)=>i.id === Number(item))
   });
     menuItem.forEach(e=>{
       const privilege = e.privilege
       setPriv({ ...priv, export:privilege.export, add:privilege.add, edit:privilege.edit, delete:privilege.delete, import:privilege.import })
     })
   } 

  useEffect(()=>{
    setLoading(true)
    const getData=async()=>{
     await axios.get(`${apiEndpoint}api/products?relations=category,unit,supplier`,{
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
        dispatch({type:"UPDATE" , payload:updatedLocalStorageProductList})
        // Set productList dengan data produk yang sudah diperbarui
        setProduct(serverProductList)
      })
      Privilage()
      setLoading(false)
    }
    getData()
  },[])
  return (
    <>
       <Helmet
        title="Point Of Sale Page"
        link={[
              {"rel": "icon", 
               "type": "image/png", 
               "sizes": '32x32',
               "href": `${apiEndpoint}storage/${setting[1].urlIcon}`
              }
             ]}
      />

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
            {/* <ProductSort /> */}
          </Stack>
        </Stack>
        {loading  ? (
              <Typography textAlign={'center'} variant='subtitle2' marginBottom={5}>.....Loading</Typography>
        ):(
          <ProductList products={productList} add={priv.add}/>
        )}
        {priv.add === 1 && (
          <ProductCartWidget openModal={openModal} handleCloseModal={handleCloseModal} handleOpenModal={handleOpenModal}/>
        )}
      </Container>
    </>
  );
}
