
export const SUPPLIER_STATE = {
    id:"",
    returnDate:""
}
export const ReturnReducer = (state,action)=>{
    switch(action.type){
        case "CHANGE_INPUT":
            return {
                ...state,
                [action.payload.name]:action.payload.value
            }
        case "IMAGE_INPUT":
            return{
                ...state,
                urlImage:action.payload
            }
        case "DATE_INPUT":
            return{
                ...state,
                returnDate:action.payload
            }
        case "UPDATE":
            return{
                ...state,
                ...action.payload,
            }
        default:
            return state
    }
}