import { createContext, useContext, useReducer } from "react"

const PosContext = createContext();

export const INITIAL_STATE = {
    product: JSON.parse(localStorage.getItem("itemsAdded")) || []
}

export const PosReducer=(state,action)=>{
    switch(action.type){
        case "ADDED":{
            const products =  JSON.parse(localStorage.getItem("itemsAdded")) 
            if(!products){
              localStorage.setItem("itemsAdded",JSON.stringify(action.payload))
            }else{
                localStorage.setItem("itemsAdded",JSON.stringify([...products, action.payload]))
            }
              return{
                  ...state,
                  product:[...state.product, action.payload],
              }
        }
        case "REMOVE":{
            const products =  JSON.parse(localStorage.getItem("itemsAdded")) 
            if(!products){
              localStorage.setItem("itemsAdded",JSON.stringify(action.payload))
            }else{
                localStorage.setItem("itemsAdded",JSON.stringify(products.filter((item)=>{item.id === action.payload})))
            }
              return{
                  ...state,
                  product:[...state.product, action.payload],
              }
        }
            default:
                return state
    }
}

export const usePos = () => {
    return useContext(PosContext);
  };
  
  export const PosProvider = ({ children }) => {
    const [state, dispatch] = useReducer(PosReducer, INITIAL_STATE);
  
    return (
      <PosContext.Provider value={{ state, dispatch }}>
        {children}
      </PosContext.Provider>
    );
  };