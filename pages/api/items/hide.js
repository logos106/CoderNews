import authUser from "../../../api/users/authUser.js"
import credential from "../../../utils/apiCredential.js"
import moment from "moment"

export default async function handler(req, res) {
  const itemId = req.query.id

  const user = await authUser(req, res)

  try {
    const directus = credential.directus

    // Find the item by ID
    const item = await directus.items('items').readOne(itemId)

    // Get the hidden
    let hiddens = await directus.items('user_hiddens').readMany({
      filter: {
        username: { _eq: user.username },
        item_id: { _eq: itemId }
      }
    });
    hiddens = hiddens.data

    // If exist already, error  ???
    if (hiddens.length > 0)
      return res.json({ submitError: true })

    // Create a favorite
    await directus.items('user_hiddens').createOne({
      username: user.username,
      item_id: itemId,
      date: moment().unix(),
      item_creation_date: item.created
    })

    return res.status(200).json({ success: true })

  } catch(error) {
    //console.log(error)
    return res.status(200).json({ submitError: true })
  }
}
