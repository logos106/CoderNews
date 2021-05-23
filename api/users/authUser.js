
import credential from '../../utils/apiCredential.js';

export default async function authUser() {
  // Check auth token to see if admin is signed in
  const directus = credential.directus
  const token = directus.auth.token

  // Sign in to Directus with admin
  if (!token) {
    await directus.auth.login({
      email: credential.email,
      password: credential.password,
    },
    {
      refresh: {
        auto: true,   // Refresh token automatically
      },
    });

    return { userSignedIn: false }
  }
  else {
    // Check the role to see if admin
    const res = await directus.users.me.read({
    	fields: ['role'],
    });

    const role = await directus.roles.readOne(res.role)
    if (role === 'Administrator')
      return { userSignedIn: false }

    return {
      userSignedIn: true,
      username: res.username,
      karma: res.karma,
      shadowBanned: res.shadow_banned
    }
  }

}
