import Cookies from "cookies"

export default async function authUser(context) {
  // Get user data from cookie
  const cookies = new Cookies(context.req, context.res)

  let username = cookies.get('username')
  let signedIn = true
  if (typeof username === 'undefined') {
    username = ''
    signedIn = false
  }
  let karma = cookies.get('karma')
  if (typeof karma === 'undefined')
    karma = 0

  return {
    userSignedIn: signedIn,
    username: username,
    karma: karma,
    shadowBanned: false
  }
}
