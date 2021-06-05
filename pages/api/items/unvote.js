import authUser from "../../../api/users/authUser.js"
import credential from "../../../utils/apiCredential.js"
import config from "../../../utils/config.js"
import moment from "moment"

export default async function handler(req, res) {
  const itemId = req.query.id

  const user = await authUser(req, res)

  try {
    const directus = credential.directus

    // Find the item by ID
    const item = await directus.items('items').readOne(itemId)
    if (!item || item.by == user.by || item.dead)
      return res.json({ submitError: true })

    // Get the vote
    let votes = await directus.items('user_votes').readMany({
      filter: {
        username: { _eq: user.username },
        item_id: { _eq: itemId },
        type: { _eq: 'item' }
      }
    });
    votes = votes.data
    if (votes.length < 1 || votes[0].date + (3600 * config.hrsUntilUnvoteExpires) < moment().unix())
      return res.json({ submitError: true })

    // Delete this vote
    await directus.items('user_votes').deleteOne(votes[0].id)

    // Update item  :  decrease points
    await directus.items('items').updateOne([item.id], {
      points: item.points - 1
    })

    // Update user  :  decrease karma
    let author = await directus.items('directus_users').readMany({
      filter: {
        username: { _eq: item.by }
      }
    })

    author = author.data[0];

    await directus.items('directus_users').updateOne([author.id], {
      karma: author.karma - 1
    })

    // searchApi.updateItemPointsCount(item.id, item.points, function() {

    return res.status(200).json({ success: true, points: item.points - 1 })

  } catch(error) {
    //console.log(error)
    return res.json({ submitError: true })
  }
}
