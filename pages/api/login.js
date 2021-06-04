import credential from "../../utils/apiCredential.js"
import authUser from "../../api/users/authUser.js"
import Cookies from 'cookies'

export default async function handler(req, res) {
  const useremail = JSON.parse(req.body).useremail;
  const password = JSON.parse(req.body).password;

  const authResult = await authUser(req, res)

  try {
    const directus = credential.directus

    // Check if any user with the eamil address
    const the_user = await directus.items('directus_users').readMany(
      {
        filter: { email: {_eq: useremail } }
      }
    )

    // If not
    if (the_user.data.length < 1) {
      return res.status(200).json({ credentialError: true })
    }

    if (the_user.data[0].banned || useremail == credential.email)
      return res.status(200).json({ bannedError: true })

    directus.auth.logout
    // Login with this credential
    await directus.auth.login({
      email: useremail,
      password: password
    }, {
      refresh: {
        auto: true,
        time: 600000
      }
    })

    // Get the token
    const token = directus.auth.token

    // Set cookie
    const cookies = new Cookies(req, res)
    cookies.set('wang_token', token, {
        httpOnly: true // true by default
    })

    return res.status(200).json({ success: true })
  } catch (error) {

    res.status(200).json({ credentialError: true })
  }

}
