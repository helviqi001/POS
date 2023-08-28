export const  INITIAL_STATE = {
    name:"",
    registerDate:"",
    address:"",
    phone:"",
    birthDate:"",
    information:""
}

export const CustomerReducer = (state,action)=>{
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
                [action.payload.fieldname]:action.payload.formattedDate
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