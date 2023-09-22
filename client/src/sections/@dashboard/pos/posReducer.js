import { createContext, useContext, useEffect, useReducer } from "react"

const PosContext = createContext();

export const INITIAL_STATE = {
    product: JSON.parse(localStorage.getItem("itemsAdded")) || [],
    formData:{
      transactionDate:"",
      deliveryMethod:"",
      paymentMethod:"",
      installment:0,
      information:"",
      informationDelivery:"",
      customer_id:0,
      fleet_id:0,
      staff_id:0,
      total:0,
    },
    validationErrors:{}
}

export const PosReducer=(state,action)=>{
    switch(action.type){
        case "ADDED":{
          const updatedCart = [...state.product, ...action.payload];
          localStorage.setItem("itemsAdded", JSON.stringify(updatedCart));
          return {
            ...state,
            product: updatedCart,
          };
        }
        case "REMOVE":{
          const productIdToRemove = action.payload;
          const updatedCart = state.product.filter((item) => item.id !== productIdToRemove);
          localStorage.setItem("itemsAdded", JSON.stringify(updatedCart));
          return {
            ...state,
            product: updatedCart,
          };
        }
        case 'RESET_STATE':
            return {
              ...state,
              product: []
            }
        case "CHANGE_INPUT":
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [action.payload.name]: action.payload.value,
                  },
                  validationErrors: {
                    ...state.validationErrors,
                    [action.payload.name]: '',
                  },
            }
        case "DATE" : 
        return{
          ...state,
          formData: {
            ...state.formData,
            transactionDate: action.payload,
          },
          validationErrors: {
            ...state.validationErrors,
            transactionDate: '',
          },
        }
        case "UPDATE": {
          return {
            ...state,
            product: action.payload,
          }
        }
        case 'SET_VALIDATION_ERROR':
                return {
                    ...state,
                    validationErrors: {
                    ...state.validationErrors,
                    [action.payload.field]: action.payload.error,
                    },
                };
            default:
                return state
    }
}

export const usePos = () => {
    return useContext(PosContext);
  };
  
  export const PosProvider = ({ children }) => {
    const [state, dispatch] = useReducer(PosReducer, INITIAL_STATE);

    useEffect(() => {
      // Simpan data keranjang ke localStorage setiap kali ada perubahan
      localStorage.setItem("itemsAdded", JSON.stringify(state.product));
    }, [state.product]);
    return (
      <PosContext.Provider value={{ state, dispatch }}>
        {children}
      </PosContext.Provider>
    );
  };