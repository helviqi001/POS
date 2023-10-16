import { Helmet } from "react-helmet-async";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { useParams } from "react-router-dom";
import { Card, CardActions, CardContent, CardMedia, Grid, Typography,Button} from "@mui/material";
import { styled } from '@mui/material/styles';
import { OutletContext } from "../layouts/dashboard/OutletProvider";
import Iconify from '../components/iconify';

export default function SettingPage(){
    const cookies = new Cookies
    const {menu,item} = useParams()
    const Privilages = JSON.parse(localStorage.getItem('privilage'))
    const setting = JSON.parse(localStorage.getItem('setting'))
    const cookie = cookies.get("Authorization")
    const {load} = useContext(OutletContext)
    const [priv,setPriv] = useState({
        edit:0,
      })
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
      });
      const Privilage = ()=>{
        let menuItem = []
        const menuGroup = Privilages.filter((m)=>m.id === Number(menu))
        menuGroup.forEach(e => {
           menuItem = e.menuitem.filter((i)=>i.id === Number(item))
       });
         menuItem.forEach(e=>{
           const privilege = e.privilege
           setPriv({ ...priv, edit:privilege.edit})
         })
       }
    const CreateLogo=async(image)=>{
            load(true)
            const formData = new FormData()
            formData.append("urlImage",image)
            formData.append("id",setting[0].id)
            await axios.post("http://localhost:8000/api/update/settings",formData,{
                headers:{
                    Authorization: `Bearer ${cookie}`
                  }
            }).then(()=>{
                load(false)
            })
        }
    const CreateIcon=async(image)=>{
            load(true)
            const formData = new FormData()
            formData.append("urlIcon",image)
            formData.append("id",setting[1].id)
            await axios.post("http://localhost:8000/api/update/settings",formData,{
                headers:{
                    Authorization: `Bearer ${cookie}`
                  }
            }).then(()=>{
                load(false)
            })
        }
        useEffect(()=>{
            Privilage()
        },[])
    return(
        <>
           <Helmet
                title="Setting Page"
                link={[
                    {"rel": "icon", 
                    "type": "image/png", 
                    "sizes": '63x32',
                    "href": `http://localhost:8000/storage/${setting[1].urlIcon}`
                    }
                    ]}
            />
            <Grid container justifyContent={"flex-start"}>
                <Grid item sm={12} md={6} lg={4}>
                    <Card sx={{ maxWidth:360 }}>
                        <img src={`http://localhost:8000/storage/${setting[0].urlImage}`} alt="Logo" style={{ padding:10 }}/>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Logo Header
                        </Typography>
                        <Typography gutterBottom variant="subtitle2" component="div">
                            setelah melakukan Perubahan mohon untuk Login ulang
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <>
                        {priv.edit === 1 && (
                            <Grid container justifyContent={'flex-end'}>
                            <Button component="label" variant="contained" sx={{ borderRadius:50}}>
                                <Iconify icon={'eva:edit-fill'}/>
                                <VisuallyHiddenInput type="file" onChange={(data)=>CreateLogo(data.target.files[0])}/>
                            </Button>
                            </Grid>
                        )}
                        </>
                    </CardActions>
                    </Card>
                </Grid>
                <Grid item sm={12} md={6} lg={4}>
                    <Card sx={{ maxWidth:360 }}>
                        <img src={`http://localhost:8000/storage/${setting[1].urlIcon}`} alt="Logo" style={{ padding:10, margin:'auto'}}/>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Icon Url
                        </Typography>
                        <Typography gutterBottom variant="subtitle2" component="div">
                            setelah melakukan Perubahan mohon untuk Login ulang
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <>
                        {priv.edit === 1 && (
                            <Grid container justifyContent={'flex-end'}>
                            <Button component="label" variant="contained" sx={{ borderRadius:50}}>
                                <Iconify icon={'eva:edit-fill'}/>
                                <VisuallyHiddenInput type="file" onChange={(data)=>CreateIcon(data.target.files[0])}/>
                            </Button>
                            </Grid>
                        )}
                        </>
                    </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </>
    )
}