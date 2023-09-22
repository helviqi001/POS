export const  INITIAL_STATE = {
    formData:{
        customer_id:0,
        depositDate:"",
        ammount:0,
        status:"Deposit",
        information:"",
    },
    validationErrors:{}
}

export const StaffReducer = (state,action)=>{
    switch(action.type){
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
        case "IMAGE_INPUT":
                return{
                    ...state,
                    formData: {
                        ...state.formData,
                        urlImage:action.payload
                      },
                      validationErrors: {
                        ...state.validationErrors,
                        urlImage: '',
                      },
                }
        case "DATE_INPUT":
            return{
                ...state,
                formData: {
                    ...state.formData,
                    depositDate:action.payload
                  },
                  validationErrors: {
                    ...state.validationErrors,
                    depositDate: '',
                  }
            }
            case "UPDATE":
                return{
                    ...state,
                    formData: {
                        ...state.formData,
                        ...action.payload,
                      },
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