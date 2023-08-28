import { RingLoader} from "react-spinners"
import "./css/loader.css"

const Loading = ()=>{
    return(
        <div className="loader">
            <div className="back">
            <RingLoader color="#36d7b7" size={70}/>

            </div>
        </div>
    )
}
export default Loading