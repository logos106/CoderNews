import authUser from "../../../api/users/authUser.js"
import credential from "../../../utils/apiCredential.js"

export default async function handler(req, res) {
  const itemId = req.query.id

  const user = await authUser(req, res)

  try {
    const directus = credential.directus

    // Find the item and delete
    let hiddens = await directus.items('user_hiddens').readMany({
      filter: {
        username: { _eq: user.username },
        item_id: { _eq: itemId }
      }
    })
    hiddens = hiddens.data

    if (hiddens.length > 0)
      await directus.items('user_hiddens').deleteOne(hiddens[0].id)

    return res.status(200).json({ success: true })

  } catch(error) {
    //console.log(error)
    return res.status(200).json({ submitError: true })
  }
}
