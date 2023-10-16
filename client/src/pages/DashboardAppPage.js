import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Button, Popover } from '@mui/material';
import { DateRangePicker } from 'react-date-range';
import { addDays, toDate } from 'date-fns';
// components
import Iconify from '../components/iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';
// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const cookies = new Cookies()
  const setting = JSON.parse(localStorage.getItem('setting'))
  const cookie = cookies.get("Authorization")
  const [open,setOpen] = useState(false)
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [allTime , setAllTime] = useState(false)
  const [state2, setState2] = useState(
    {
      startDate: "",
      endDate: "",
      flag: 0,
    }
  );
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    }
  ]);
  const [productList,setProduct] = useState([])
  useEffect(()=>{
    const dataState =()=> state.forEach(p => {
      const startdate = p.startDate
      const enddate = p.endDate
      let flag = 0
      const formattedStartDate = `${startdate.getFullYear()}-${(startdate.getMonth() + 1).toString().padStart(2, '0')}-${startdate.getDate().toString().padStart(2, '0')} 00:00`;
      const formattedEndDate = `${enddate.getFullYear()}-${(enddate.getMonth() + 1).toString().padStart(2, '0')}-${enddate.getDate().toString().padStart(2, '0')} 23:59`;

      // pertahun
      if (startdate.getFullYear() !== enddate.getFullYear() && startdate.getMonth() === enddate.getMonth() && startdate.getDate() === enddate.getDate()){
         flag = 1
      }
      if (startdate.getFullYear() !== enddate.getFullYear() && startdate.getMonth() === enddate.getMonth() && startdate.getDate() !== enddate.getDate()){
         flag = 1
      }
      if (startdate.getFullYear() !== enddate.getFullYear() && startdate.getMonth() !== enddate.getMonth() && startdate.getDate() !== enddate.getDate()){
         flag = 1
      }
      if (startdate.getFullYear() !== enddate.getFullYear() && startdate.getMonth() !== enddate.getMonth() && startdate.getDate() === enddate.getDate()){
         flag = 1
      }

      // perbulan
      if (startdate.getFullYear() === enddate.getFullYear() && startdate.getMonth() !== enddate.getMonth() && startdate.getDate() <= enddate.getDate()){
        flag = 2
      }
      
      // perminggu
      if (startdate.getFullYear() === enddate.getFullYear() && startdate.getMonth() === enddate.getMonth() && startdate.getDate() !== enddate.getDate()){
        flag = 3
      }
      if (startdate.getFullYear() === enddate.getFullYear() && startdate.getMonth() !== enddate.getMonth() && startdate.getDate() > enddate.getDate()){
        flag = 3
      }
      
      // perhari
      if (startdate.getFullYear() === enddate.getFullYear() && startdate.getMonth() === enddate.getMonth() && startdate.getDate() === enddate.getDate()){
         flag = 4
      }
      setState2(
        {
          startDate:formattedStartDate,
          endDate:formattedEndDate,
          flag
        }
      )
    })
    dataState()
  },[state])

  useEffect(() => {
    const Data = async () => {
      setOpen(false)
      setLoading(true)
      await axios.post("http://localhost:8000/api/dashboard", {
        startDate: state2.startDate, // Misalnya, Anda hanya ingin mengambil data dari elemen pertama state2
        endDate: state2.endDate,
        flag:state2.flag
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cookie}`
        }
      }).then(response => {
        setLoading(false)
        setProduct(response.data);
      });
    }
    Data();
  }, [state2, cookie]);
  const theme = useTheme();

  const Calender =(event)=>{
    setAllTime(false)
    setAnchorEl(event.currentTarget);
    setOpen(true)
  }
  const handleClose =()=>{
    setOpen(false)
  }
  console.log(productList);
  return (
    <>
      <Helmet
        title="Dashboard Page"
        link={[
              {"rel": "icon", 
               "type": "image/png", 
               "sizes": '32x32',
               "href": `http://localhost:8000/storage/${setting[1].urlIcon}`
              }
             ]}
      />
        {loading ? (
          <>
             <Typography textAlign={'center'} variant='subtitle2' marginBottom={5}>.....Loading</Typography>
          </>
        ) : (
          <>
          <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid container justifyContent={'flex-end'} spacing={2}>
            <Grid item>
                <Button variant="outlined" onClick={(e)=>Calender(e)}>
                  Calender
                </Button>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary type='string' title="Total Products" total={`${Number(productList.Product)}`} icon={'carbon:product'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary type='number' title="income" total={`${Number(productList.Income)}`} color="info" icon={'uil:money-insert'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary type='number' title="Expense" total={`${Number(productList.Expense)}`} color="warning" icon={'uil:money-withdraw'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary type='string' title="Total Quantity Sold" total={`${Number(productList.quantitySold)}`} color="error" icon={'material-symbols:move-item-rounded'} />
          </Grid>

          <Grid item xs={12} md={6} lg={12}>
            <AppWebsiteVisits
              title="Gross Income & Expense"  
              // subheader="Gross satuan Rupiah"
              chartLabels={Object.keys(productList.transactionDay)}
              chartData={[
                {
                  name: 'Gross',
                  type: 'area',
                  fill: 'gradient',
                  data: Object.keys(productList.transactionDay).map(key=>productList.transactionDay[key]),
                },
                {
                  name: 'Expense',
                  type: 'area',
                  fill: 'gradient',
                  data: Object.keys(productList.expenseDay).map(key=>productList.expenseDay[key]),
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Current Visits"
              chartData={[
                { label: 'America', value: 4344 },
                { label: 'Asia', value: 5435 },
                { label: 'Europe', value: 1443 },
                { label: 'Africa', value: 4443 },
              ]}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.info.main,
                theme.palette.warning.main,
                theme.palette.error.main,
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <Button onClick={()=>setAllTime(true)}>All Time</Button>
            <AppConversionRates
              title="Top 10 Products"
              chartData={allTime === true ?  Object.keys(productList.SalesProductAllTime).map((key) => ({
                label: key, // Use the key as the label
                value: productList.SalesProductAllTime[key], // Use the value based on the key
              })) : Object.keys(productList.SalesProductPeriode).map((key) => ({
                label: key, // Use the key as the label
                value: productList.SalesProductPeriode[key], // Use the value based on the key
              }))}
            />
          </Grid>



          {/* <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject
              title="Current Subject"
              chartLabels={['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math']}
              chartData={[
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ]}
              chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppNewsUpdate
              title="News Update"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: faker.name.jobTitle(),
                description: faker.name.jobTitle(),
                image: `/assets/images/covers/cover_${index + 1}.jpg`,
                postedAt: faker.date.recent(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppOrderTimeline
              title="Order Timeline"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: [
                  '1983, orders, $4220',
                  '12 Invoices have been paid',
                  'Order #37745 from September',
                  'New order placed #XF-2356',
                  'New order placed #XF-2346',
                ][index],
                type: `order${index + 1}`,
                time: faker.date.past(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppTrafficBySite
              title="Traffic by Site"
              list={[
                {
                  name: 'FaceBook',
                  value: 323234,
                  icon: <Iconify icon={'eva:facebook-fill'} color="#1877F2" width={32} />,
                },
                {
                  name: 'Google',
                  value: 341212,
                  icon: <Iconify icon={'eva:google-fill'} color="#DF3E30" width={32} />,
                },
                {
                  name: 'Linkedin',
                  value: 411213,
                  icon: <Iconify icon={'eva:linkedin-fill'} color="#006097" width={32} />,
                },
                {
                  name: 'Twitter',
                  value: 443232,
                  icon: <Iconify icon={'eva:twitter-fill'} color="#1C9CEA" width={32} />,
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppTasks
              title="Tasks"
              list={[
                { id: '1', label: 'Create FireStone Logo' },
                { id: '2', label: 'Add SCSS and JS files if required' },
                { id: '3', label: 'Stakeholder Meeting' },
                { id: '4', label: 'Scoping & Estimations' },
                { id: '5', label: 'Sprint Showcase' },
              ]}
            />
          </Grid> */}
        </Grid>
          <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <DateRangePicker
            onChange={item => setState([item.selection])}
            showSelectionPreview
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={state}
            direction="horizontal"
          />;
        </Popover>
      </Container>
          </>
        )}
      
    </>
  );
}
