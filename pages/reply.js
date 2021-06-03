import { Component } from "react"
import authUser from "../api/users/authUser.js"
import AlternateHeader from "../components/alternateHeader.js"
import HeadMetadata from "../components/headMetadata.js"
import Comment from "../components/comment.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import getReplyPageData from "../api/comments/getReplyPageData.js"

import styles from "../styles/pages/comment.module.css"

export async function getServerSideProps (context/* { req, query, res } */) {
  const commentId = context.query.id ? context.query.id : ""
  const authResult = await authUser(context.req, context.res)
  const result = await getReplyPageData(commentId, authResult)

  if (!authResult.userSignedIn) {
    context.res.writeHead(302, {
      Location: `/login?goto=reply?id=${commentId}`
    })
    context.res.end()
  }

  return {
    props: {
      authUserData: authResult,
      comment: typeof result.comment === 'undefined' ? null : result.comment,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      notFoundError: typeof result.notFoundError === 'undefined' ? false : result.notFoundError,
      goToString: `reply?id=${commentId}`
    }
  }
}

export default class extends Component {
  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title="Add Comment Reply | Coder News"
        />
        <GoogleAnalytics />
        <AlternateHeader
          displayMessage="Reply to Comment"
        />
        <div className={styles.comment_content_container}>
          {
            !this.props.getDataError && !this.props.notFoundError ?
            <>
              <Comment
                comment={this.props.comment}
                userSignedIn={this.props.authUserData.userSignedIn}
                currUsername={this.props.authUserData.username}
                showDownvote={this.props.authUserData.showDownvote}
                goToString={this.props.goToString}
              />
            </> :
            <div className={styles.comment_get_data_error_msg}>
              {
                this.props.notFoundError ?
                <span>No such comment.</span> :
                <span>An error occurred.</span>
              }
            </div>
          }
        </div>
      </div>
    )
  }
}
