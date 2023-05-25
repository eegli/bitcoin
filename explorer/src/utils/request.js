import axios from "axios"
import qs from "querystring"

const errorHandle = (status, info)=>{
    switch(status){
        case 400:
            console.log("Semantic Error!");
            break;
        case 401:
            console.log("Server Authentication Failed!");
            break;
        case 403:
            console.log("Server Denies Access!");
            break;
        case 404:
            console.log("Wrong address!");
            break;
        case 500:
            console.log("The Server Encountered an Accident!");
            break;
        case 502:
            console.log("Server Unresponsive!");
            break;
        default:
            console.log(info);
            break;
    }
}

const instance = axios.create({
    timeout:5000
})

instance.interceptors.request.use(
    config =>{
        if(config.method === "post"){
            config.data = qs.stringify(config.data)
        }
        return config;
    },
    error => Promise.reject(error)
)

instance.interceptors.response.use(
    response => response.status === 200 ?
Promise.resolve(response) :
Promise.reject(response),
    error =>{
        const {response} = error;
    errorHandle(response.status, response.info)
    }
)

export default instance;