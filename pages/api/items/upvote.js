import authUser from "../../../api/users/authUser.js"
import credential from "../../../utils/apiCredential.js"
import config from "../../utils/config.js"
import moment from "moment"

export default async function handler(req, res) {
  const itemId = req.query.id

  const user = await authUser()

  try {
    const directus = credential.directus

    // Find the item by ID
    const item = await directus.items('items').readOne(id)
    if (!item || item.by == user.by || item.dead)
      return res.json({ submitError: true })

    // Get the vote
    const votes = await directus.items('user_votes').readMany({
      filter: {
        username: { _eq: user.username },
        item_id: { _eq: itemId },
        type: { _eq: 'item' }
      }
    });
    votes = votes.data
    if (votes.length > 0)
      return res.json({ submitError: true })

    // Create a new vote
    await directus.items('user_votes').createOne({
      username: authUser.username,
      type: "item",
      item_id: itemId,
      upvote: true,
      downvote: false,
      date: moment().unix()
    })

    // Update item  :  decrease points
    await directus.items('items').updateOne([item.id], {
      points: item.points + 1
    })

    // Update user  :  decrease karma
    const me = await directus.users.me.read();
    await directus.users.me.update({
      karma: me.karma + 1
    });

    // searchApi.updateItemPointsCount(item.id, item.points, function() {

    return res.status(200).json({ success: true })

  } catch(error) {
    console.log(error)
    return res.json({ submitError: true })
  }
}
