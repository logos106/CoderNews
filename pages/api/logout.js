import { Directus, Auth } from '@directus/sdk';
import authUser from "../../api/users/authUser.js"
import credential from "../../utils/apiCredential.js"
import Cookies from 'cookies'

export default async function handler(req, res) {
  try {
    // Delete Cookie
    const cookies = new Cookies(req, res)
    cookies.set('wang_token')

    // Logout from Directus
    const directus = credential.directus
    await directus.auth.logout();

    return res.status(200).json({ success: true })
  } catch (error) {
    //console.log(error)
    res.status(200).json({ submitError: true })
  } finally {
  }

}
