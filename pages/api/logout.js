import { Directus, Auth } from '@directus/sdk';
import authUser from "../../api/users/authUser.js"
import credential from "../../utils/apiCredential.js"

export default async function handler(req, res) {
  const authResult = await authUser()

  try {
    const directus = credential.directus
    await directus.auth.logout();

    return res.status(200).json({ success: true })
  } catch (error) {
    console.log(error)
    res.status(200).json({ submitError: true })
  }

}
