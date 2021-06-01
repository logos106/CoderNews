import { Component } from "react"

import "../styles/pages/delete-comment.module.css"

import AlternateHeader from "../components/alternateHeader.js"
import HeadMetadata from "../components/headMetadata.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import authUser from "../api/users/authUser.js"
import renderPointsString from "../utils/renderPointsString.js"
import renderCreatedTime from "../utils/renderCreatedTime.js"
import truncateItemTitle from "../utils/truncateItemTitle.js"
import getDeleteCommentPageData from "../api/comments/getDeleteCommentPageData.js"

// import deleteComment from "../api/comments/deleteComment.js"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)
  const result = await getDeleteCommentPageData(context.query.id, authResult)
  
  return {
    props: {
      comment: typeof result.comment === 'undefined' ? null : result.comment,
      authUserData: authResult,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      notAllowedError: typeof result.notAllowedError === 'undefined' ? false : result.notAllowedError,
      notFoundError: typeof result.notFoundError === 'undefined' ? false : result.notFoundError,
      goToString: context.query.goto ? decodeURIComponent(context.query.goto) : ""
    }
  }
}

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      notAllowedError: this.props.notAllowedError,
      notFoundError: this.props.notFoundError,
      loading: false,
      submitError: false
    }
  }

  submitDeleteComment = async () => {
    if (this.state.loading) return

    const self = this
    let res = await fetch("/api/comments/delete", {
      method: "POST",
      body: JSON.stringify({
        commentId: this.props.comment.id
      })
    })

    let response = await res.json()
  
    if (response.notAllowedError) {
      self.setState({
        loading: false,
        notAllowedError: true,
        submitError: false
      })
    } else if (response.submitError || !response.success) {
      self.setState({
        loading: false,
        notAllowedError: false,
        submitError: true
      })
    } else {
      window.location.href = `/${self.props.goToString}`
    }
  }

  goBackToOriginPage = () => {
    if (this.state.loading) return

    window.location.href = `/${this.props.goToString}`
  }

  render () {
    const comment = this.props.comment

    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title="Delete Comment | Coder News"
        />
        <GoogleAnalytics />
        <AlternateHeader
          displayMessage="Delete Comment"
        />
        <div className="delete-comment-content-container">
          {
            !this.props.getDataError && !this.state.notAllowedError && !this.state.notFoundError ?
            <>
              <div className="delete-comment-top-section">
                <table>
                  <tbody>
                    <tr>
                      <td valign="top">
                        <div className="delete-comment-top-section-star">
                          <span>*</span>
                        </div>
                      </td>
                      <td>
                        <span className="delete-comment-top-section-points">
                          {comment.points.toLocaleString()} {renderPointsString(comment.points)}
                        </span>
                        <span> by <a href={`/user?id=${comment.by}`}>{comment.by}</a> </span>
                        <span>
                          <a href={`/comment?id=${comment.id}`}>{renderCreatedTime(comment.created)}</a>
                        </span>
                        <span> | </span>
                        <span className="delete-comment-top-section-parent">
                          <a href={comment.is_parent ? `/item?id=${comment.parent_id}` : `/comment?id=${comment.parent_comment_id}`}>parent</a>
                        </span>
                        <span> | </span>
                        <span>
                          <a href={`/edit-comment?id=${comment.id}`}>edit</a>
                        </span>
                        <span> | </span>
                        <span className="delete-comment-top-section-article-title">
                          on: <a href={`/item?id=${comment.parent_id}`}>{truncateItemTitle(comment.parent_title)}</a>
                        </span>
                        <div className="delete-comment-content-text">
                          <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="delete-comment-confirm-msg">
                <span>Do you want to delete this comment?</span>
              </div>
              <div className="delete-comment-btns">
                <input
                  type="submit"
                  value="Yes"
                  className="delete-comment-yes-btn"
                  onClick={this.submitDeleteComment}
                />
                <input
                  type="submit"
                  value="No"
                  onClick={this.goBackToOriginPage}
                />
              </div>
              {
                this.state.submitError ?
                <div className="delete-comment-submit-error-msg">
                  <span>An error occurred.</span>
                </div> : null
              }
            </> :
            <div className="delete-comment-error-msg">
              {
                this.props.getDataError ?
                <span>An error occurred.</span> : null
              }
              {
                this.state.notAllowedError ?
                <span>You can’t delete that comment.</span> : null
              }
              {
                this.state.notFoundError ?
                <span>Comment not found.</span> : null
              }
            </div>
          }
        </div>
      </div>
    )
  }
}
