export const  INITIAL_STATE = {
    formData:{
        name:"",
        registerDate:"",
        address:"",
        phone:0,
        position_id:0,
        information:"",
        urlImage:"",
    },
    validationErrors:{}
}
export const  INITIAL_STATE2 = {
    formData:{
        name:"",
        registerDate:"",
        address:"",
        phone:0,
        position_id:0,
        information:"",
        urlImage:"",
        oldPassword: "",
        newPassword: "",
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
                    registerDate:action.payload
                  },
                  validationErrors: {
                    ...state.validationErrors,
                    registerDate: '',
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