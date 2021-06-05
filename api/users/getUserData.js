import { Directus, Auth } from '@directus/sdk';
import authUser from "./authUser.js"
import credential from "../../utils/apiCredential.js"

export default async function getUserData(username, authUser) {
  try {
    const directus = credential.directus

    // Search the user table
    const users = await directus.items('directus_users').readMany({
      filter: {
        username: {
          _eq: username,
        }
      }
    });

    if (users.data.length < 1) {
      return { notFoundError: true }
    }

    const user = users.data[0]

    if (!authUser.userSignedIn || authUser.username != username) {
      if (authUser.isModerator)
        user.shadowBanned = user.shadow_banned

      return {
        user: user,
        showPrivateUserData: false
      }
    } else {
      const aboutText = user.about ? user.about
          .replace(/<a\b[^>]*>/i,"").replace(/<\/a>/i, "")
          .replace(/<i\b[^>]*>/i,"*").replace(/<\/i>/i, "*")
          : ""
      user.about = aboutText

      return {
        user: user,
        showPrivateUserData: true
      }
    }
  } catch(error) {
    //console.log(error)
    return {getDataError: true}
  }
}
