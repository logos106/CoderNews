
import { Directus, Auth } from '@directus/sdk';
import cookieCutter from "cookie-cutter"

import credential from "../../utils/apiCredential.js"

export default async function loginUser(username, password, callback) {
  // Instantiate a new Directus object
  const directus = new Directus(credential.baseURL);

  // Login to Directus
  await directus.auth.login({
    email: credential.email,
    password: credential.password,
  },
  {
  	refresh: {
  		auto: true,   // Refresh token automatically
  	},
  });

  // Search the user table
  const user = await directus.items('users').readMany({
    filter: {
      username: {
        _eq: username,
      },
      password: {
        _eq: password
      }
    },
  });

  // If user and password is correct
  if (user.data.length > 0) {
    // Save user data as cookie
    cookieCutter.set('username', user.data[0].username)
    cookieCutter.set('karma', user.data[0].karma)
    cookieCutter.set('containsEmail', user.data[0].containsEmail)
    cookieCutter.set('showDead', user.data[0].showDead)
    cookieCutter.set('showDownvote', user.data[0].karma >= user.data[0].minimumKarmaToDownvot)
    cookieCutter.set('isModerator', user.data[0].isModerator)
    cookieCutter.set('shadowBanned', user.data[0].shadowBanned)

    callback({
      credentialError: false,
      bannedError: false,
      submitError: false,
      success: true
    });
  }
  else {
    callback({
      credentialError: true,
      bannedError: false,
      submitError: false,
      success: false
    });
  }
}
