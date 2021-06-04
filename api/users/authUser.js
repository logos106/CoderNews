import Cookies from 'cookies'
import credential from '../../utils/apiCredential.js'
import config from "../../utils/config.js"

export default async function authUser(req, res) {
  const directus = credential.directus
  // Check cookie
  const cookies = new Cookies(req, res)
  let token = cookies.get('wang_token')
  if (token) {
    try {

      const res = await directus.auth.static(token);
      if (res) {
        const me = await directus.users.me.read();
        return {
          id: me.id,
          userSignedIn: true,
          email: !me.email ? '' : me.email,
          username: !me.username ? '' : me.username,
          karma: !me.karma ? 0 : me.karma,
          shadowBanned: me.shadow_banned,
          showDead: me.show_dead,
          isModerator: me.is_moderator,
          showDownvote : false //!me.karma ? false : (me.karma >= config.minimumKarmaToDownvote)
        }
      }
    } catch (e) {
      // console.log("Static Login Error: ", e)
    }
  }

  // Login as Administrator
  await directus.auth.login({
    email: credential.email,
    password: credential.password,
    mode: 'cookie'
  }, {
    refresh: {
      auto: true,   // Refresh token automatically
      time: 600000
    },
  });

  return { userSignedIn: false, username: 'guest', karma: 0, isModerator: false }
}
