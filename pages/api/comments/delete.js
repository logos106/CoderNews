import credential from "../../../utils/apiCredential.js"
import authUser from "../../../api/users/authUser.js"
import config from "../../../utils/config"
import moment from "moment"

export default async function handler(req, res) {
  const commentId = JSON.parse(req.body).commentId;

  const authResult = await authUser(req, res)

  const directus = credential.directus

  if (!authResult.userSignedIn)    return res.status(200).json({notAllowedError: true})
  if (!commentId)                  return res.status(200).json({submitError: true})

  try {
    // Find a comment by id
    let comment = await directus.items('comments').readOne(commentId)
    
    if (!comment.children) comment.children = [];
    else {
        var children = comment.children.split(";");
        comment.children = children
    }

    if (!comment) return res.status(200).json({ submitError: true})
    else if (comment.dead) {
      return res.status(200).json({ notAllowedError: true })
    } else if (comment.by !== authResult.username) {
      return res.status(200).json({ notAllowedError: true })
    } else if (comment.created + (3600 * config.hrsUntilEditAndDeleteExpires) < moment().unix()) {
      return res.status(200).json({ notAllowedError: true })
    } else if (comment.children.length > 0) {
      return res.status(200).json({ notAllowedError: true })
    }

    await directus.items("comments").deleteOne(commentId)

    const newUserKarmaValue = authResult.karma - comment.points

    let item = await directus.items('items').readOne(comment.parent_id)
    await directus.items('items').updateOne(comment.parent_id, {
        comment_count: item.comment_count-1
    })

    await directus.items('directus_users').updateOne(authResult.id, {
        karma: newUserKarmaValue
    })

    if (!comment.is_parent) {
        let parentComment = await directus.items('comments').readOne(comment.parent_comment_id)
        if (!parentComment.children) parentComment.children = null;
        else {
            let children = parentComment.children.split(";")
            let str_children = "";
            children.shift()
            children.forEach(child => {
                if (child != comment.id) str_children += ";" + child;
            });
            str_children = str_children.splice(0, str_children.lenght-1)

            await directus.items('comments').updateOne(comment.parent_comment_id, {
                children: str_children
            })
        }
    }
    // await searchApi.deleteComment(comment.id, item.id, item.commentCount - 1)
    return res.status(200).json({ success: true })
  } catch (error) {
    //console.log(error)
    res.status(200).json({ submitError: true })
  }

}
