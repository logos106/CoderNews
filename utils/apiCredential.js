let baseURL

if (process.env.NODE_ENV === "development") {
  baseURL = 'http://192.168.8.141:8055'//process.env.DEVELOPMENT_API_URL
} else {
  baseURL = process.env.PRODUCTION_API_URL
}

let email = 'logos106@outlook.com'
let password = 'glowglow'

export default {
  baseURL: baseURL,
  email: email,
  password: password
}
