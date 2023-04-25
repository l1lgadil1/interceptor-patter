import axios, {Axios, AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";

const url = 'http://localhost:3000'

const authRequest = axios.create({
    baseURL:url,
    headers:{
        'Content-type':'application/json'
})

const onRequest = (config:AxiosRequestConfig):any =>{
    if(config?.headers){
        config.headers.Authorization = `Bearer ${localStorage.getItem('token')|| ""}`
    }
    return config;
}

const onRequestError = (error:AxiosError):Promise<AxiosError> =>{
    return Promise.reject(error);
}

const onResponse = (response:AxiosResponse):AxiosResponse =>{
    return response;
}

const onResponseError = async(error:any):Promise<AxiosError> =>{
    if(error.response && error.config){
        if((error.response.status ===401) || (error.response.status == 403) && !error.config?.isRetry){
            error.config.isRetry = true;
            try{
                const res = await axios.post(`${url}/api/token/refresh`.{
                    refresh:localStorage.getItem('tokenRefresh')
                })
                const {access} = res.data;
                localStorage.setItem('tokenAccess',access);
                error.config!.headers = {...error.config!.headers}
                return authRequest(error.config);
            }catch(_error){
                localStorage.removeItem('tokenAccess')
                localStorage.removeItem('tokenRefresh')
                return Promise.reject(_error);
            }
        }
    }

    return Promise.reject(error);
}

export const setupInterceptorsTo = (axiosInstance:AxiosInstance) =>{
    axiosInstance.interceptors.request.use(onRequest,onRequestError);
    axiosInstance.interceptors.response.use(onResponse,onResponseError);
    return axiosInstance;
}
export default setupInterceptorsTo(authRequest)