
import credential from '../../utils/apiCredential.js';

export default async function authUser() {
  const directus = credential.directus

  // Check auth token to see if anyone is signed in
  // await directus.auth.refresh(true)
  const token = directus.auth.token
  if (token) {
    // Check the role to see if admin
    const me = await directus.users.me.read();
    const role = await directus.roles.readOne(me.role)
    if (role.name != 'Administrator') {
      // It means user signed in
      return {
        userSignedIn: true,
        username: !me.username ? '' : me.username,
        karma: !me.karma ? 0 : me.karma,
        shadowBanned: me.shadow_banned,
        showDead: me.show_dead,
        isModerator: me.is_moderator
      }
    }
    else
      return { userSignedIn: false, username: 'guest', karma: 0, isModerator: false }
  }

  // Log in to Directus as admin
  directus.auth.logout
  
  await directus.auth.login({
    email: credential.email,
    password: credential.password,
    mode: 'cookie'
  },
  {
    refresh: {
      auto: true,   // Refresh token automatically
    },
  });

  return { userSignedIn: false, username: 'guest', karma: 0, isModerator: false }

}
