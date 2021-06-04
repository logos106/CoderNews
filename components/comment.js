import { Component } from "react"
import renderPointsString from "../utils/renderPointsString.js"
import renderCreatedTime from "../utils/renderCreatedTime.js"
import truncateItemTitle from "../utils/truncateItemTitle.js"

import styles from "../styles/components/comment.module.css"

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      comment: this.props.comment,
      replyInputValue: "",
      loading: false,
      replyTextRequiredError: false,
      replyTextTooLongError: false,
      replySubmitError: false
    }
  }

  updateReplyInputValue = (event) => {
    this.setState({replyInputValue: event.target.value})
  }

  requestSubmitReply = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else if (!this.state.replyInputValue) {
      this.setState({
        replyTextRequiredError: true,
        replyTextTooLongError: false,
        replySubmitError: false
      })
    } else if (this.state.replyInputValue.length > 5000) {
      this.setState({
        replyTextRequiredError: false,
        replyTextTooLongError: true,
        replySubmitError: false
      })
    } else {
      this.setState({loading: true})

      const commentData = {
        parentItemId: this.props.comment.parent_id,
        isParent: false,
        parentCommentId: this.props.comment.id,
        text: this.state.replyInputValue
      }

      const self = this

      let res = await fetch("/api/comments/add", {
        method: "POST",
        body: JSON.stringify(commentData)
      })

      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else if (response.textRequiredError) {
        self.setState({
          loading: false,
          replyTextRequiredError: true,
          replyTextTooLongError: false,
          replySubmitError: false
        })
      } else if (response.textTooLongError) {
        self.setState({
          loading: false,
          replyTextRequiredError: false,
          replyTextTooLongError: true,
          replySubmitError: false
        })
      } else if (response.submitError || !response.success) {
        self.setState({
          loading: false,
          replyTextRequiredError: false,
          replyTextTooLongError: false,
          replySubmitError: true
        })
      } else {
        window.location.href = `/comment?id=${self.props.comment.id}`
      }
    }
  }

  requestUpvoteComment = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      this.state.comment.votedOnByUser = true
      this.forceUpdate()

      const self = this
      let res = await fetch("/api/comments/upvote", {
        method: "POST",
        body: JSON.stringify({
          commentId: this.state.comment.id,
          parentItemId: this.state.comment.parent_id
        })
      })

      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        self.setState({loading: false})
      }
    }
  }

  requestDownvoteComment = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      this.state.comment.votedOnByUser = true
      this.forceUpdate()

      const self = this
      let res = await fetch("/api/comments/downvote", {
        method: "POST",
        body: JSON.stringify({
          commentId: this.state.comment.id,
          parentItemId: this.state.comment.parent_id,
        })
      })

      let response = await res.json()
      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        self.setState({loading: false})
      }
    }
  }

  requestUnvoteComment = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      this.state.comment.votedOnByUser = false
      this.forceUpdate()

      const self = this
      let res = await fetch("/api/comments/unvote", {
        method: "POST",
        body: JSON.stringify({
          commentId: this.state.comment.id
        })
      })

      let response = await res.json()
      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        self.setState({loading: false})
      }
    }
  }

  requestFavoriteComment = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      const self = this
      let res = await fetch("/api/comments/favorite", {
        method: "POST",
        body: JSON.stringify({
          commentId: this.state.comment.id
        })
      })
      let response = await res.json()
      
      console.log("=======", response)
      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        window.location.href = `/favorites?id=${self.props.currUsername}&comments=t`
      }
    }
  }

  requestUnfavoriteComment = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      this.state.comment.favoritedByUser = false
      this.forceUpdate()

      const self = this
      let res = await fetch("/api/comments/unfavorite", {
        method: "POST",
        body: JSON.stringify({
          commentId: this.state.comment.id
        })
      })

      let response = await res.json()
      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        self.setState({loading: false})
      }
    }
  }

  requestKillComment = async () => {
    if (this.state.loading) return

    this.setState({loading: true})

    let res = await fetch("/api/moderation/killComment?id=" + this.state.comment.id, {
      method: "GET"})
    let response = await res.json()

    window.location.href = ""
  }

  requestUnkillComment = async () => {
    if (this.state.loading) return

    this.setState({loading: true})

    let res = await fetch("/api/moderation/unkillComment?id=" + this.state.comment.id, {
      method: "GET"})
    let response = await res.json()

    window.location.href = ""
  }

  render () {
    const comment = this.state.comment
    const currUsername = this.props.currUsername

    return (
      <div className={styles.comment_content}>
        <table>
          <tbody>
            <tr>
              <td valign="top">
                {
                  comment.by === currUsername ?
                  <div className={styles.comment_content_star}>
                    <span>*</span>
                  </div> : null
                }
                {
                  comment.by !== currUsername ?
                  <>
                    {
                      comment.votedOnByUser || comment.dead ?
                      <>
                        <div className={[styles.comment_content_upvote, styles.hide].join(' ')}>
                          <span></span>
                        </div>
                      </> :
                      <>
                        <div className={styles.comment_content_upvote} onClick={() => this.requestUpvoteComment()}>
                          <span></span>
                        </div>
                      </>
                    }
                  </> : null
                }
                {
                  comment.by !== currUsername ?
                  <>
                    {
                      comment.votedOnByUser || comment.dead || !this.props.showDownvote ?
                      <>
                        <div className={[styles.comment_content_downvote, styles.hide].join(' ')}>
                          <span></span>
                        </div>
                      </> :
                      <>
                        <div className={styles.comment_content_downvote} onClick={() => this.requestDownvoteComment()}>
                          <span></span>
                        </div>
                      </>
                    }
                  </> : null
                }
              </td>
              <td>
                <div className={styles.comment_content_details}>
                  {
                    currUsername === comment.by ?
                    <span>{comment.points.toLocaleString()} {renderPointsString(comment.points)} by </span> : null
                  }
                  <span className={styles.comment_content_author}>
                    <a href={`/user?id=${comment.by}`}>{comment.by}</a>
                  </span>
                  <span className={styles.comment_content_time}>
                    <a href={`/comment?id=${comment.id}`}>{renderCreatedTime(comment.created)}</a>
                  </span>
                  {
                    comment.dead ?
                    <span className={styles.comment_content_dead}> [dead]</span> : null
                  }
                  {
                    comment.votedOnByUser && !comment.unvoteExpired && !comment.dead ?
                    <>
                      <span> | </span>
                      <span className={styles.comment_content_unvote} onClick={() => this.requestUnvoteComment()}>un-vote</span>
                    </> : null
                  }
                  <span> | </span>
                  <span className={styles.comment_content_parent}>
                    <a href={comment.is_parent ? `/item?id=${comment.parent_id}` : `/comment?id=${comment.parent_comment_id}`}>parent</a>
                  </span>
                  {
                    this.props.showFavoriteOption ?
                    <>
                      {
                        comment.favoritedByUser ?
                        <>
                          <span> | </span>
                          <span className={styles.comment_content_favorite} onClick={() => this.requestUnfavoriteComment()}>un-favorite</span>
                        </> :
                        <>
                          <span> | </span>
                          <span className={styles.comment_content_favorite} onClick={() => this.requestFavoriteComment()}>favorite</span>
                        </>
                      }
                    </> : null
                  }
                  {
                    comment.by === currUsername && !comment.editAndDeleteExpired && !comment.dead ?
                    <>
                      <span> | </span>
                      <span>
                        <a href={`/edit-comment?id=${comment.id}`}>edit</a>
                      </span>
                    </> : null
                  }
                  {
                    comment.by === currUsername && !comment.editAndDeleteExpired && !comment.dead ?
                    <>
                      <span> | </span>
                      <span>
                        <a href={`/delete-comment?id=${comment.id}&goto=${encodeURIComponent(this.props.goToString)}`}>delete</a>
                      </span>
                    </> : null
                  }
                  {
                    this.props.isModerator && !comment.dead ?
                    <>
                      <span> | </span>
                      <span className={styles.comment_content_kill} onClick={() => this.requestKillComment()}>kill</span>
                    </> : null
                  }
                  {
                    this.props.isModerator && comment.dead ?
                    <>
                      <span> | </span>
                      <span className={styles.comment_content_kill} onClick={() => this.requestUnkillComment()}>un-kill</span>
                    </> : null
                  }
                  <span> | </span>
                  <span>
                    on: <a href={`/item?id=${comment.parent_id}`}>{truncateItemTitle(comment.parent_title)}</a>
                  </span>
                </div>
                <div className={styles.comment_content_text}>
                  <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        {
          !comment.dead ?
          <>
            <div className={styles.comment_content_repy_box}>
              <textarea
                type="text"
                value={this.state.replyInputValue}
                onChange={this.updateReplyInputValue}
              />
            </div>
            <div className={styles.comment_content_reply_btn}>
              <input
                type="submit"
                value="reply"
                onClick={() => this.requestSubmitReply()}
              />
            </div>
            {
              this.state.replyTextRequiredError ?
              <div className={styles.comment_content_reply_error_msg}>
                <span>Text is required.</span>
              </div> : null
            }
            {
              this.state.replyTextTooLongError ?
              <div className={styles.comment_content_reply_error_msg}>
                <span>Text exceeds limit of 5,000 characters.</span>
              </div> : null
            }
            {
              this.state.replySubmitError ?
              <div className={styles.comment_content_reply_error_msg}>
                <span>An error occurred.</span>
              </div> : null
            }
          </> : null
        }
      </div>
    )
  }
}
