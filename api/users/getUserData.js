import { Directus, Auth } from '@directus/sdk';
import authUser from "./authUser.js"
import credential from "../../utils/apiCredential.js"

export default async function getUserData(context) {
  try {
    // Instantiate a new Directus object
    const directus = new Directus(credential.baseURL);
    const authResult = authUser(context)
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

    if (!context.query.id) {
      return {
        notFoundError: true,
        getDataError: true,
      }
    }

    // Search the user table
    const users = await directus.items('users').readMany({
      filter: {
        username: {
          _eq: context.query.id,
        }
      }
    });

    let user;
    if (users.data.length > 0) {
      user = users.data[0]
    }
    // console.log("Show dead: ", user.showDead, user);
    if (!authResult.userSignedIn || authResult.username != context.query.id) {
      if (authResult.isModerator) 
        return {
          user: {
            id: user.id,
            username: user.username,
            created: user.created,
            karma: user.karma,
            about: user.about,
            shadowBanned: user.shadow_banned ? true : false,
            banned: user.banned ? true : false,
          },
          showPrivateUserData: false
        }
      else
        return {
          user: {
            id: user.id,
            username: user.username,
            created: user.created,
            karma: user.karma,
            about: user.about
          },
          showPrivateUserData: false
        }
    } else {
      const aboutText = user.about
          .replace(/<a\b[^>]*>/i,"").replace(/<\/a>/i, "")
          .replace(/<i\b[^>]*>/i,"*").replace(/<\/i>/i, "*")
      return {
        user: {
          id: user.id,
          username: user.username,
          created: user.created,
          karma: user.karma,
          about: aboutText,
          email: user.email,
          showDead: user.show_dead,
        },
        showPrivateUserData: true
      }
    }  
  } catch(error) {
    return {getDataError: true}
  }
}
