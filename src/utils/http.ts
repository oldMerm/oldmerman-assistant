import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  AxiosError
} from 'axios';
import router from '@/router';


// 环境变量配置（推荐）或使用默认值 /oldmerman/ if prod
const API_BASE_URL = 'http://localhost:8000';

// 创建带类型的 axios 实例
const httpInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
httpInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (!config.headers) {
      config.headers = {} as any; // 初始化 headers 避免类型问题
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) return config;
    config.headers['Content-Type'] = 'application/json; charset=utf-8';
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

interface Response {
  code?: number;
  message?: string;
  data?: any;
  time?: string;
  request?: string;
  [key: string]: any; // 允许其他字段存在
}

// 响应拦截器 - 使用泛型保持类型安全
httpInstance.interceptors.response.use(
  <Response>(response: AxiosResponse<Response>): Promise<Response> => {
    // 直接返回响应数据体
    const res: any = response.data;
    return res;
  },
  async (error: AxiosError<Response>): Promise<AxiosError<Response>> => {
    // 统一处理响应错误（状态码、网络错误等）
    const res = error.response;
    const errorMessage = res?.data?.message || error.message || 'Request failed';
    console.error('Response Error:', errorMessage);

    if(res?.status === 401){
      router.push({name: "login"});
    }

    return Promise.reject(error);
  }
);

export { httpInstance, API_BASE_URL };
export type { Response };

// ==================== 使用示例 ====================
//
// 请求前处理：添加 token、loading 状态等
// const token = localStorage.getItem('token');
// if (token) {
//   config.headers = {
//     ...config.headers,
//     Authorization: `Bearer ${token}`,
//   };
// }
// ==================================================
// interface UserData {
//   id: number;
//   name: string;
// }
//
// // 自动推断返回类型为 UserData
// const getUser = async (id: number) => {
//   return await httpInstance.get<UserData>(`/api/user/${id}`);
// };
//
// // 错误处理
// try {
//   const user = await getUser(1);
//   console.log(user.name); // 类型安全
// } catch (error) {
//   console.error('Failed to fetch user:', error);
// }
// ==================================================