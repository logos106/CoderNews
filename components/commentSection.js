import { Component } from "react"
import renderCreatedTime from "../utils/renderCreatedTime.js"
import sortCommentChildren from "../utils/sortCommentChildren.js"
import getNumberOfChildrenComments from "../utils/getNumberOfChildrenComments.js"
import generateCommentTextClassName from "../utils/generateCommentTextClassName.js"

import styles from "../styles/components/commentSection.module.css"

function Comment({
  parentCommentIndex,
  comment,
  type,
  currUsername,
  showDownvote,
  goToString,
  requestUpvoteComment,
  requestDownvoteComment,
  requestUnvoteComment,
  collapseComment,
  uncollapseComment,
  isModerator,
  requestKillComment,
  requestUnkillComment
}) {

  const nestedComments = (sortCommentChildren(comment.children) || []).map((comment) => {
    return <Comment
      key={comment.id}
      parentCommentIndex={parentCommentIndex}
      comment={comment}
      type="child"
      currUsername={currUsername}
      showDownvote={showDownvote}
      goToString={goToString}
      requestUpvoteComment={requestUpvoteComment}
      requestDownvoteComment={requestDownvoteComment}
      requestUnvoteComment={requestUnvoteComment}
      collapseComment={collapseComment}
      uncollapseComment={uncollapseComment}
      isModerator={isModerator}
      requestKillComment={requestKillComment}
      requestUnkillComment={requestUnkillComment}
    />
  })

  return (
    <>
      <div key={comment.id} className={type === "parent" ? styles.comment_section_comment_parent : styles.comment_section_comment_child }>
        {
          !comment.isCollapsed ?
          <div className={styles.comment_section_comment_details}>
            <table>
              <tbody>
                <tr>
                  <td valign="top">
                    {
                      comment.by === currUsername ?
                      <div className={styles.comment_section_comment_star}>
                        <span>*</span>
                      </div> : null
                    }
                    {
                      comment.by !== currUsername ?
                      <>
                        {
                          comment.votedOnByUser || comment.dead ?
                          <>
                            <div className={[styles.comment_section_comment_upvote, styles.hide].join(' ')}>
                              <span></span>
                            </div>
                          </> :
                          <>
                            <div className={styles.comment_section_comment_upvote} onClick={() => requestUpvoteComment(comment.id)}>
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
                          comment.votedOnByUser || !showDownvote || comment.dead ?
                          <>
                            <div className={[styles.comment_section_comment_downvote, styles.hide].join(' ')}>
                              <span></span>
                            </div>
                          </> :
                          <>
                            <div className={styles.comment_section_comment_downvote} onClick={() => requestDownvoteComment(comment.id)}>
                              <span></span>
                            </div>
                          </>
                        }
                      </> : null
                    }
                  </td>
                  <td>
                    <span>
                      <a href={`/user?id=${comment.by}`}>{comment.by}</a>
                    </span>
                    <span>
                      <a href={`/comment?id=${comment.id}`}> {renderCreatedTime(comment.created)}</a>
                    </span>
                    {
                      comment.dead ?
                      <span> [dead]</span> : null
                    }
                    {
                      comment.votedOnByUser && !comment.unvoteExpired ?
                      <>
                        <span> | </span>
                        <span className={styles.comment_section_comment_unvote_btn} onClick={() => requestUnvoteComment(comment.id)}>un-vote</span>
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
                          <a href={`/delete-comment?id=${comment.id}&goto=${encodeURIComponent(goToString)}`}>delete</a>
                        </span>
                      </> : null
                    }
                    {
                      isModerator && !comment.dead ?
                      <>
                        <span> | </span>
                        <span className={styles.comment_section_kill} onClick={() => requestKillComment(comment.id)}>kill</span>
                      </> : null
                    }
                    {
                      isModerator && comment.dead ?
                      <>
                        <span> | </span>
                        <span className={styles.comment_section_kill} onClick={() => requestUnkillComment(comment.id)}>un-kill</span>
                      </> : null
                    }
                    <span className={styles.comment_section_comment_collapse_btn} onClick={() => collapseComment(comment.id, parentCommentIndex)}> [‒]</span>
                    <div className={generateCommentTextClassName(comment.points)}>
                      <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
                    </div>
                    <div className={styles.comment_section_comment_reply}>
                      <span>
                        <a href={`/reply?id=${comment.id}`}>reply</a>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            {nestedComments}
          </div> :
          <div className={styles.comment_section_comment_collapsed}>
            <span>
              <a href={`/user?id=${comment.by}`}>{comment.by} </a>
            </span>
            <span>
              <a href={`/comment?id=${comment.id}`}>{renderCreatedTime(comment.created)}</a>
            </span>
            <div className={styles.comment_section_comment_collapsed_btn}>
              <span>[</span>
              <span className={styles.comment_section_comment_collapsed_btn_value} onClick={() => uncollapseComment(comment.id, parentCommentIndex)}>+{comment.numOfHiddenChildren}</span>
              <span>]</span>
            </div>
          </div>
        }
      </div>
    </>
  )
}

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      comments: this.props.comments,
      loading: false
    }
  }

  requestUpvoteComment = async (commentId) => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      const self = this

      const findAndUpdateComment = function(parentComment) {
        if (parentComment.id === commentId) {
          parentComment.votedOnByUser = true

          self.forceUpdate()
        } else {
          if (parentComment.children) {
            for (let i=0; i < parentComment.children.length; i++) {
              findAndUpdateComment(parentComment.children[i])
            }
          }
        }
      }

      for (let i=0; i < this.state.comments.length; i++) {
        findAndUpdateComment(this.state.comments[i])
      }
      let res = await fetch("/api/comments/upvote", {
        method: "POST",
        body: JSON.stringify({
          commentId: commentId,
          parentItemId: this.props.parentItemId
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

  requestDownvoteComment = async (commentId) => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      const self = this

      const findAndUpdateComment = function(parentComment) {
        if (parentComment.id === commentId) {
          parentComment.votedOnByUser = true

          self.forceUpdate()
        } else {
          if (parentComment.children) {
            for (let i=0; i < parentComment.children.length; i++) {
              findAndUpdateComment(parentComment.children[i])
            }
          }
        }
      }

      for (let i=0; i < this.state.comments.length; i++) {
        findAndUpdateComment(this.state.comments[i])
      }

      let res = await fetch("/api/comments/downvote", {
        method: "POST",
        body: JSON.stringify({
          commentId: commentId,
          parentItemId: this.props.parentItemId,
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

  requestUnvoteComment = async (commentId) => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      const self = this

      const findAndUpdateComment = function(parentComment) {
        if (parentComment.id === commentId) {
          parentComment.votedOnByUser = false

          self.forceUpdate()
        } else {
          if (parentComment.children) {
            for (let i=0; i < parentComment.children.length; i++) {
              findAndUpdateComment(parentComment.children[i])
            }
          }
        }
      }

      for (let i=0; i < this.state.comments.length; i++) {
        findAndUpdateComment(this.state.comments[i])
      }
      let res = await fetch("/api/comments/unvote", {
        method: "POST",
        body: JSON.stringify({
          commentId: commentId
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

  collapseComment = (commentId, parentCommentIndex) => {
    const self = this

    const findAndUpdateComment = function(comment) {
      if (comment.id === commentId) {
        comment.isCollapsed = true
        if (comment.children) {
          comment.numOfHiddenChildren = getNumberOfChildrenComments(comment)
        } else {
          comment.numOfHiddenChildren = 0
        }

        self.forceUpdate()
      } else {
        if (comment.children) {
          for (let i = 0; i < comment.children.length; i++) {
            findAndUpdateComment(comment.children[i])
          }
        }
      }
    }

    findAndUpdateComment(this.state.comments[parentCommentIndex])
  }

  uncollapseComment = (commentId, parentCommentIndex) => {
    const self = this

    const findAndUpdateComment = function(parentComment) {
      if (parentComment.id === commentId) {
        parentComment.isCollapsed = false

        self.forceUpdate()
      } else {
        if (parentComment.children) {
          for (let i=0; i < parentComment.children.length; i++) {
            findAndUpdateComment(parentComment.children[i])
          }
        }
      }
    }

    findAndUpdateComment(this.state.comments[parentCommentIndex])
  }

  requestKillComment = (commentId) => {
    if (this.state.loading) return

    this.setState({loading: true})

    killComment(commentId, function(response) {
      window.location.href = ""
    })
  }

  requestUnkillComment = (commentId) => {
    if (this.state.loading) return

    this.setState({loading: true})

    unkillComment(commentId, function(response) {
      window.location.href = ""
    })
  }

  render() {
    return (
      <>
        {
          this.state.comments ?
          this.state.comments.map((comment, index) => {
            return (
              <Comment
                key={comment.id}
                parentCommentIndex={index}
                comment={comment}
                type="parent"
                currUsername={this.props.currUsername}
                showDownvote={this.props.showDownvote}
                goToString={this.props.goToString}
                requestUpvoteComment={this.requestUpvoteComment}
                requestDownvoteComment={this.requestDownvoteComment}
                requestUnvoteComment={this.requestUnvoteComment}
                collapseComment={this.collapseComment}
                uncollapseComment={this.uncollapseComment}
                isModerator={this.props.isModerator}
                requestKillComment={this.requestKillComment}
                requestUnkillComment={this.requestUnkillComment}
              />
            )
          }) : null
        }
        {
          this.props.isMore ?
          <div className={styles.comment_section_more}>
            <span>
              <a href={this.props.isMoreLink}>More</a>
            </span>
          </div> : null
        }
      </>
    )
  }
}
