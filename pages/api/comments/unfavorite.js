import credential from "../../../utils/apiCredential.js"
import authUser from "../../../api/users/authUser.js"

export default async function handler(req, res) {
  const commentId = JSON.parse(req.body).commentId

  if (!commentId)
    return res.json({ submitError: true })

  const user = await authUser(req, res)
    
  if (!user.userSignedIn)
    return res.json({ authError: true })

  try {
    const directus = credential.directus
    let fav = await directus.items("user_favorites").readMany({
        filter: {
            username: { _eq: user.username },
            item_id: { _eq: commentId }
        }
    })
    if (!fav.data.length) return res.json({submitError})
    fav = fav.data[0]
    await directus.items("user_favorites").deleteOne(fav.id)

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(200).json({ submitError: true })
  }

}
