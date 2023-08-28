import { createContext, useContext } from 'react';

export const OutletContext = createContext();


export const OutletProvider = ({ children, load }) => {
  return (
    <OutletContext.Provider value={{ load }}>
      {children}
    </OutletContext.Provider>
  );
};