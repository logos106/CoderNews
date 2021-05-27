import credential from "../../../utils/apiCredential.js"
import authUser from "../../../api/users/authUser.js"

export default async function handler(req, res) {
  if (!req.query.id)
    return res.json({ submitError: true })

  const user = await authUser()
  if (!user.userSignedIn)
    return res.json({ authError: true })

  try {
    const directus = credential.directus

    // Get the item
    const itemId = req.query.id
    let item = await directus.items('items').readOne(req.query.id);

    // Get the favorite
    const favs = await directus.items('user_favorites').readMany({
      filter: {
        username: { _eq: user.username },
        item_id: { _eq: itemId },
        type: { _eq: 'item' }
      }
    });
    favs = favs.data

    // If exist already, error  ???
    if (favs.length > 0)
      return res.json({ submitError: true })

    // Create a favorite
    await directus.items('user_favorites').createOne({
      username: user.username,
      type: "item",
      id: itemId,
      date: moment().unix()
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(200).json({ submitError: true })
  }

}
