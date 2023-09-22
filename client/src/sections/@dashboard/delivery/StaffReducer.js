export const  INITIAL_STATE = {
    formData:{
        deliveryDate:"",
        deliveredDate:"",
        status:"",
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
            case "DATE_INPUT":
                return{
                    ...state,
                    formData: {
                        ...state.formData,
                       [ action.payload.name]:action.payload.value
                      },
                      validationErrors: {
                        ...state.validationErrors,
                        [ action.payload.name]: '',
                      }
                }
        default:
            return state
    }
}