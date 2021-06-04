import { Component } from "react"
import authUser from "../api/users/authUser.js"
import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import Comment from "../components/comment.js"
import CommentSection from "../components/commentSection.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import truncateCommentText from "../utils/truncateCommentText.js"
import getCommentById from "../api/comments/getCommentById.js"

import styles from "../styles/pages/comment.module.css"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)

  const commentId = context.query.id ? context.query.id : ""
  const page = context.query.page ? parseInt(context.query.page) : 1

  const result = await getCommentById(commentId, page, authResult)
  
  return {
    props: {
      authUserData: authResult,
      comment: typeof result.comment === 'undefined' ? null : result.comment,
      page: page,
      notFoundError: typeof result.notFoundError === 'undefined' ? false : result.notFoundError,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      isMoreChildrenComments: typeof result.isMoreChildrenComments === 'undefined' ? false : result.isMoreChildrenComments,
      goToString: page > 1 ? `comment?id=${commentId}&page=${page}` : `comment?id=${commentId}`
    }
  }
}

export default class extends Component {
  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title={this.props.comment ? `${truncateCommentText(this.props.comment.pageMetadataTitle)} | Coder News` : "Coder News"}
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData && this.props.authUserData.userSignedIn}
          username={this.props.authUserData && this.props.authUserData.username}
          karma={this.props.authUserData && this.props.authUserData.karma}
          goto={this.props.goToString}
        />
        <div className={styles.comment_content_container}>
          {
            this.props.comment && !this.props.getDataError && !this.props.notFoundError ?
            <>
              <Comment
                comment={this.props.comment}
                userSignedIn={this.props.authUserData.userSignedIn}
                currUsername={this.props.authUserData.username}
                goToString={this.props.goToString}
                showDownvote={this.props.authUserData.showDownvote}
                showFavoriteOption={true}
                isModerator={this.props.authUserData.isModerator}
              />
              <CommentSection
                comments={this.props.comment.children}
                parentItemId={this.props.comment.parent_id}
                isMore={this.props.isMoreChildrenComments}
                isMoreLink={`/comment?id=${this.props.comment.id}&page=${this.props.page + 1}`}
                userSignedIn={this.props.authUserData.userSignedIn}
                currUsername={this.props.authUserData.username}
                showDownvote={this.props.authUserData.showDownvote}
                goToString={this.props.goToString}
                isModerator={this.props.authUserData.isModerator}
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
        <Footer />
      </div>
    
    )
  }
}
