export const  INITIAL_STATE = {
    formData:{
        name:"",
        netPrice:0,
        discount:0,
        sellingPrice:0,
        tax:0,
        supplier_id:"",
        category_id:"",
        unit_id:"",
        urlImage:"",
        information:"",
        margin:0
    },
    validationErrors:{}
}

export const ProductRecuder = (state,action)=>{
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

            case 'SET_SELLING_PRICE':
                return {
                  ...state,
                  formData: {
                    ...state.formData,
                    sellingPrice: action.payload,
                  },
                };
          
        default:
            return state
    }
}