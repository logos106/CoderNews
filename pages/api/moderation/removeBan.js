import authUser from "../../../api/users/authUser.js"
import credential from "../../../utils/apiCredential.js"
import moment from "moment"

export default async function handler(req, res) {
  const username = req.query.user

  const moderator = await authUser(req, res)

  try {
    const directus = credential.directus

    // Find the user
    let users = await directus.items('directus_users').readMany({
      filter: {
        username: { _eq: username }
      }
    })
    users = users.data

    if (users.length < 1)
      return res.json({ submitError: true })

      await directus.items('directus_users').updateMany([users[0].id], {
          banned: false
      })

    // Create a moderation log
    await directus.items('moderation_logs').createOne({
      moderator_user_name: moderator.username,
      actionType: "remove-user-ban",
      username: username,
      created: moment().unix()
    })

    return res.status(200).json({ success: true })

  } catch(error) {
    //console.log(error)
    return res.status(200).json({ submitError: true })
  }
}
