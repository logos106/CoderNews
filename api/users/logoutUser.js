import cookieCutter from "cookie-cutter"

export default function logoutUser(callback) {
  // Delete a cookie
  cookieCutter.set('username', '', { expires: new Date(0) })
  cookieCutter.set('karma', '', { expires: new Date(0) })

  callback()
}
