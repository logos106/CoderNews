import { Directus, Auth } from '@directus/sdk';
import authUser from "./authUser.js"
import credential from "../../utils/apiCredential.js"

export default async function updateUserData(inputData, callback) {
  try {
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
    const id = inputData.id
    var returnedVal = await directus.items('users').updateMany([id], {
      about: inputData.about,
      email: inputData.email,
      show_dead: inputData.showDead
    });
    console.log("Returned Value: ", returnedVal)
    if (returnedVal.statusText == "OK") {
      callback({success: true})
    }
  } catch (error) {
    callback({submitError: true})
  }
  /* axios.put(apiBaseUrl + "/users/update-user-data", {
    inputData: inputData
  }, {
    withCredentials: true
  })
  .then(function(response) {
    callback(response.data)
  })
  .catch(function(error) {
    callback({submitError: true})
  }) */
}
