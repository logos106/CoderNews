
import { Directus, Auth } from '@directus/sdk';
import cookieCutter from "cookie-cutter"

import credential from "../../utils/apiCredential.js"

export default async function loginUser(email, password) {
  // Instantiate a new Directus object
  const directus = credential.directus
  try {
    let res = await directus.auth.login({
      email: email,
      password: password
    }, {
      refresh: {
        auto: true
      }
    })
    console.log("Login Res: ", res)
    return true
  } catch (error) {
    console.log("Error: ", error)
    return false
  }

  // // Login to Directus
  // await directus.auth.login({
  //   email: credential.email,
  //   password: credential.password
  // },
  // {
  // 	refresh: {
  // 		auto: true,   // Refresh token automatically
  // 	}
  // });

  // // Search the user table
  // const hashed_password = await directus.utils.hash.generate(password);
  // const user = await directus.items('directus_users').readMany({
  //   filter: {
  //     username: {
  //       _eq: username,
  //     },
  //     /* password: {
  //       _eq: hashed_password
  //     } */
  //   },
  // });
  
  // // If user and password is correct
  // if (user.data.length > 0) {
  //   var r = await directus.auth.login({
  //     email: user.data[0].email,
  //     password: password
  //   })
  //   console.log("logged user: ", user, username, password, r)
  //   callback({
  //     credentialError: false,
  //     bannedError: false,
  //     submitError: false,
  //     success: true
  //   });
  // }
  // else {
  //   callback({
  //     credentialError: true,
  //     bannedError: false,
  //     submitError: false,
  //     success: false
  //   });
  // }
}
