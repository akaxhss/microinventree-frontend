import axios from 'axios'

const api = axios.create({
  baseURL: 'http://103.14.120.137:8080/api/', // Django API root
  headers: { 'Content-Type': 'application/json' },
})

// Attach token before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Handle token expiry (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          // request a new access token
          const res = await axios.post('http://103.14.120.137:8080/api/token/refresh/', {
            refresh: refreshToken,
          })

          const newAccessToken = res.data.access
          localStorage.setItem('accessToken', newAccessToken)

          // retry the original request with new token
          error.config.headers.Authorization = `Bearer ${newAccessToken}`
          return api.request(error.config)
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          localStorage.clear()
          window.location.href = '/login' // redirect to login
        }
      } else {
        localStorage.clear()
        window.location.href = '/login' // no refresh token back to login
      }
    }

    return Promise.reject(error)
  },
)

export default api
