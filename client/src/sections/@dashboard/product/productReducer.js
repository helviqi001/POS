export const  INITIAL_STATE = {
    name:"",
    netPrice:0,
    discount:0,
    sellingPrice:0,
    tax:0,
    costOfGoodsSold: 0,
    supplier:"",
    supplier_id:"",
    category:"",
    category_id:"",
    unit:"",
    unit_id:"",
    stock: 0,
    coli: 0,
    urlImage:"",
    information:""
}

export const ProductRecuder = (state,action)=>{
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
        case "UPDATE":
            return{
                ...state,
                ...action.payload,
            }
        default:
            return state
    }
}