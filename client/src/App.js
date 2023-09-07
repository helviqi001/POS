import { BrowserRouter, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import { StyledChart } from './components/chart';
import ScrollToTop from './components/scroll-to-top';
import { AuthContextProvider } from './Auth';
import { PosProvider } from './sections/@dashboard/pos/posReducer';

// ----------------------------------------------------------------------

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <ScrollToTop />
          <StyledChart />
      <AuthContextProvider>
        <PosProvider>
          <Router />
          <Outlet/>
        </PosProvider>
    </AuthContextProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
