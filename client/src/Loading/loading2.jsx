import { RingLoader} from "react-spinners"
import "./css/loader2.css"

const Loading2 = ()=>{
    return(
        <div className="loader2">
            <div className="back">
            <RingLoader color="#36d7b7" size={65}/>

            </div>
        </div>
    )
}
export default Loading2