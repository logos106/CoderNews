import credential from "../../../utils/apiCredential.js"
import authUser from "../../../api/users/authUser.js"

export default async function handler(req, res) {
  if (!req.query.id)
    return res.json({ submitError: true })

  const commentId = req.query.id
  
  const user = await authUser()
    
  if (!user.userSignedIn)
    return res.json({ authError: true })

  try {
    const directus = credential.directus
    
    let comment = await directus.items('comments').readOne(commentId);

    if (!comment) return res.json({submitError: true})
    // Get the favorite
    const favs = await directus.items('user_favorites').readMany({
      filter: {
        username: { _eq: user.username },
        id: { _eq: commentId },
        type: { _eq: 'comment' }
      }
    });
    favs = favs.data

    // If exist already, error  ???
    if (favs.length > 0)
      return res.json({ submitError: true })

    // Create a favorite
    await directus.items('user_favorites').createOne({
      username: user.username,
      type: "comment",
      id: commentId,
      date: moment().unix()
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(200).json({ submitError: true })
  }

}
