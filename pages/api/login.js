import { Directus, Auth } from '@directus/sdk';
import authUser from "../../api/users/authUser.js"
import credential from "../../utils/apiCredential.js"

export default async function handler(req, res) {
  const useremail = JSON.parse(req.body).useremail;
  const password = JSON.parse(req.body).password;
  const directus = credential.directus

  const authResult = await authUser()

  try {
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

    // Login with this credential
    await directus.auth.login({
      email: useremail,
      password: password
    }, {
      refresh: {
        auto: true
      }
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.log(error)
    res.status(200).json({ submitError: true })
  }

}
