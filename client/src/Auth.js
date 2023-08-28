import { createContext, useState } from "react"
import axios from "axios"
import Cookies from "universal-cookie"
import { useNavigate } from "react-router-dom"


const AuthContext = createContext()
export const AuthContextProvider = ({children})=>{
    const cookies = new Cookies()
    const navigate = useNavigate()
    const [user,setUser] = useState(()=>{
        const userProfile =  localStorage.getItem("userProfile")
        if(!userProfile){
            return null
        }
        return JSON.parse(userProfile)
    })

    const login = async(paylod)=>{
        axios.get("http://localhost:8000/sanctum/csrf-cookie").then(response=>{
            console.log(response);
        })
        axios.post("http://localhost:8000/api/auth", paylod, {withCredentials:true}).then(response=>{
            cookies.set("Authorization",response.data.token)
            const cookie = cookies.get("Authorization")
            axios.get("http://localhost:8000/api/profile",{
                headers: {
                    "Content-Type" : "aplication/json",
                    "Authorization" : `Bearer ${cookie}`
                }
            }).then(response=>{
                localStorage.setItem("userProfile",JSON.stringify(response.data))
                setUser(response.data)
                navigate("/dashboard/app")
            })
        })
    }

    const logout = async()=>{
        const cookie = cookies.get("Authorization")
        axios.post("http://localhost:/api/logout",{},{
            headers: {
                "Content-Type" : "aplication/json",
                "Authorization" : `Bearer ${cookie}`
            }
        })
        cookies.remove("Authorization");
        localStorage.removeItem("userProfile")
        setUser(null);
        navigate("/");
        console.log(user);
    }

    return(
        <AuthContext.Provider value={{ user , login , logout }}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthContext