import { Directus } from '@directus/sdk'
import credential from "../../utils/apiCredential.js"

export default async function createNewUser(username, password, callback) {

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
  
  try {

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
    // If user doesn't exist
    if (user.data.length == 0) {
      const users = directus.items('users')
      const newuser = await users.createOne({
        username: username,
        password: password,
        auth_token: "ddddddd",
        show_dead: false,
        is_moderator: false,
        shadow_banned: false,
        banned: false
      })
      console.log("new user: ", newuser)
      callback({
        usernameLengthError: false,
        passwordLengthError: false,
        alreadyExistsError: false,
        success: true,
        submitError: false
      })
    }
  } catch(error) {
    return {
      getDataError: true
    }
  }
}

/* 
export default function createNewUser(username, password, callback) {
  axios.post(apiBaseUrl + "/users/create-new-user", {
    username: username,
    password: password
  }, {
    withCredentials: true
  })
  .then(function(response) {
    callback(response.data)
  })
  .catch(function(error) {
    callback({submitError: true})
  })
}
 */