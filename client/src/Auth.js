import { createContext, useState } from "react"
import axios from "axios"
import Cookies from "universal-cookie"
import { useNavigate } from "react-router-dom"


const AuthContext = createContext()
export const AuthContextProvider = ({children})=>{
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const [forget,setForget] = useState(false)
    const cookies = new Cookies()
    const navigate = useNavigate()
    const [state2, setState] = useState({
        open: false,
        vertical: 'top',
        horizontal: 'center',
        message:"",
        variant:""
      });
    
      const { vertical, horizontal, open , message ,variant } = state2;
      
      const handleClick = (message,variant) => {
        setState({ ...state2, open: true , message,variant });
      };
      const handleClose = () => {
        setState({ ...state2, open: false });
      };
    const [user,setUser] = useState(()=>{
        const userProfile =  localStorage.getItem("userProfile")
        if(!userProfile){
            return null
        }
        return JSON.parse(userProfile)
    })
    console.log(apiEndpoint);
    const login = async(paylod)=>{
            await axios.get(`${apiEndpoint}sanctum/csrf-cookie`)
            try{
                await axios.post(`${apiEndpoint}api/auth`, paylod, {withCredentials:true}).then(response=>{
                    localStorage.setItem("privilage",JSON.stringify(response.data.privilage))
                    localStorage.setItem("setting",JSON.stringify(response.data.setting))
                    cookies.set("Authorization",response.data.token)
                    const cookie = cookies.get("Authorization")
                    axios.get(`${apiEndpoint}api/profile`,{
                        headers: {
                            "Content-Type" : "aplication/json",
                            "Authorization" : `Bearer ${cookie}`
                        }
                    }).then(response=>{
                        handleClick("Login Success",'success')
                        setTimeout(()=>{
                            localStorage.setItem("userProfile",JSON.stringify(response.data))
                            setUser(response.data)
                             navigate("/dashboard/app")
                          },1500)
                    })
                })
            }catch(error){
                handleClick("The username or password entered is incorrect",'error')
            }
    }

    const Reset = async(paylod)=>{
            try{
                await axios.post(`${apiEndpoint}api/forgotPassword`, paylod, {withCredentials:true}).then(response=>{
                    handleClick(response.data.message,'success')
                    setTimeout(()=>{
                         setForget(false)
                      },1500)
                })
            }catch(error){
                console.log(error);
                handleClick(error.response.data.error,'error')
            }
    }

    const Logout = async()=>{
        const cookie = cookies.get(`Authorization`)
        await axios.post(`${apiEndpoint}api/logout`,{},{
            headers: {
                "Content-Type" : "aplication/json",
                "Authorization" : `Bearer ${cookie}`
            }
        }).then(()=>{
            cookies.remove("Authorization");
            localStorage.removeItem("userProfile")
            setUser(null);
        })
        navigate("/");
    }



    return(
        <AuthContext.Provider value={{ user , login , Logout, vertical, horizontal, open , message ,variant,handleClose,forget,setForget,Reset}}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthContext