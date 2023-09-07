export const INITIAL_STATE = {
    product:[]
}

export const PosReducer=(state,action)=>{
    switch(action.type){
        case "ADDED":
            return{
                ...state,
                product:action.payload
            }
            default:
                return state
    }
}