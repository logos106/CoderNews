import authUser from "../../api/users/authUser.js"
import credential from "../../utils/apiCredential.js"
import moment from "moment"
import Cookies from 'cookies'

export default async function handler(req, res) {
  const username = JSON.parse(req.body).username;
  const useremail = JSON.parse(req.body).useremail;
  const password = JSON.parse(req.body).password;
  const directus = credential.directus

  if (username.length < 2 || username.length > 15) {
    return res.status(200).json({usernameLengthError: true})
  } else if (useremail.length < 5) {
    return res.status(200).json({useremailLengthError: true})
  } else if (password.length < 8) {
    return res.status(200).json({passwordLengthError: true})
  }
  await authUser(req, res)

  try {
    // Check if any user with the eamil address
    const the_user = await directus.items('directus_users').readMany(
      {
        filter: { email: {_eq: useremail } },
        or: {
            username: { _eq: username }
        }
      }
    )

    // If not
    if (the_user.data.length > 0) {
      return res.status(200).json({alreadyExistsError: true})
    }

    // Get the role
    let readerRole = await directus.roles.readMany({filter: {name: 'reader'}})

    const newuser = await directus.items('directus_users').createOne({
      username: username,
      email: useremail,
      password: password,
      role: readerRole.data[0].id,
      created: moment().unix()
    })
    console.log("RES: ", newuser)

    if (newuser) {
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
    }
    return res.status(200).json({
      success: true,
      username: username,
    })
  } catch (error) {
    //console.log(error)
    res.status(200).json({ submitError: true })
  }

}
