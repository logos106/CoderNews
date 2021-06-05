import credential from "../../../utils/apiCredential.js"
import authUser from "../../../api/users/authUser.js"
import moment from "moment"

export default async function handler(req, res) {
  const parentItemId = JSON.parse(req.body).parentItemId;
  const isParent = JSON.parse(req.body).isParent;
  const parentCommentId = JSON.parse(req.body).parentCommentId;
  let text = JSON.parse(req.body).text;

  const authResult = await authUser(req, res)

  const directus = credential.directus

  try {
    text= text.trim()
    text = text.replace(/<[^>]+>/g, "")
    text = text.replace(/\*([^*]+)\*/g, "<i>$1</i>")
    // text = linkifyUrls(text)
    // text = xss(text)

    // Get the parent item's title
    let item = await directus.items('items').readOne(parentItemId);
    let parent_title = item.title

    // Save the comment into the table
    let new_comment = await directus.items('comments').createOne({
      by: authResult.username,
      parent_id: parentItemId,
      parent_title: parent_title,
      is_parent: isParent,
      parent_comment_id: parentCommentId,
      text: text,
      points: 0,
      created: moment().unix(),
      dead: authResult.shadowBanned ? true : false
    });

    // Updaate my user data . increase karms
    let me = await directus.users.me.read({
    	fields: ['karma'],
    });
    await directus.users.me.update({ karma: me.karma + 1 });

    // Update the item  .  count of comment
    await directus.items('items').updateMany(
    	[parentItemId],
    	{
    		comment_count: item.comment_count + 1,
    	}
    );

    // Update parent comment's children field
    if (parentCommentId) {
      let comment = await directus.items('comments').readOne(parentCommentId)

      let children = ''
      if (comment.children)
      children = comment.children

      children = children + ';' + new_comment.id

      await directus.items('comments').updateMany(
        [parentCommentId],
        {
          children: children
        }
      );
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    //console.log(error)
    res.status(200).json({ submitError: true })
  }

}
