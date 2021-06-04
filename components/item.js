import { Component } from "react"
import renderCreatedTime from "../utils/renderCreatedTime.js"

import styles from "../styles/components/item.module.css"

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      item: this.props.item,
      commentInputValue: "",
      loading: false,
      commentTextRequiredError: false,
      commentTextTooLongError: false,
      commentSubmitError: false
    }
  }

  updateCommentInputValue = (event) => {
    this.setState({commentInputValue: event.target.value})
  }

  requestAddNewComment = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else if (!this.state.commentInputValue) {
      this.setState({
        commentTextRequiredError: true,
        commentTextTooLongError: false,
        commentSubmitError: false
      })
    } else if (this.state.commentInputValue.length > 5000) {
      this.setState({
        commentTextRequiredError: false,
        commentTextTooLongError: true,
        commentSubmitError: false
      })
    } else {
      this.setState({loading: true})

      const commentData = {
        parentItemId: this.state.item.id,
        isParent: true,
        parentCommentId: null,
        text: this.state.commentInputValue,
      }

      const self = this
      console.log('joe', commentData)
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
          commentTextRequiredError: true,
          commentTextTooLongError: false,
          commentSubmitError: false
        })
      } else if (response.textTooLongError) {
        self.setState({
          loading: false,
          commentTextRequiredError: false,
          commentTextTooLongError: true,
          commentSubmitError: false
        })
      } else if (response.submitError || !response.success) {
        self.setState({
          loading: false,
          commentTextRequiredError: false,
          commentTextTooLongError: false,
          commentSubmitError: true
        })
      } else {
        window.location.href = ""
      }

    }
  }

  requestUpvoteItem = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      this.state.item.votedOnByUser = true
      this.forceUpdate()

      const self = this

      let res = await fetch("/api/items/upvote?id=" + this.state.item.id, {method: "GET"})
      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        self.setState({loading: false})
      }

    }
  }

  requestUnvoteItem = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      this.state.item.votedOnByUser = false
      this.forceUpdate()

      const self = this

      let res = await fetch("/api/items/unvote?id=" + this.state.item.id, {method: "GET"})
      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        self.setState({loading: false})
      }

    }
  }

  requestFavoriteItem = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      const self = this

      const itemId = this.state.item.id
      let res = await fetch("/api/items/favorite?id=" + this.state.item.id, {
        method: "GET"
      })

      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else if (!response.success) {
        window.location.href = ""
      } else {
        window.location.href = `/favorites?id=${self.props.currUsername}`
      }
    }
  }

  requestUnfavoriteItem = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      const self = this

      let res = await fetch("/api/items/unfavorite?id=" + this.state.item.id, {method: "GET"})
      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else if (!response.success) {
        window.location.href = ""
      } else {
        window.location.href = `/favorites?id=${self.props.currUsername}`
      }
    }
  }

  requestHideItem = async () => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      this.state.item.hiddenByUser = true
      this.forceUpdate()

      const self = this

      let res = await fetch("/api/items/hide?id=" + this.state.item.id, {method: "GET"})
      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else if (!response.success) {
        window.location.href = ""
      } else {
        self.setState({loading: false})
      }
    }
  }

  requestUnhideItem = async () => {
    if (this.state.loading) return

    this.setState({loading: true})

    this.state.item.hiddenByUser = false
    this.forceUpdate()

    const self = this

    let res = await fetch("/api/items/hide?id=" + this.state.item.id, {method: "GET"})
    let response = await res.json()

    if (response.authError) {
      window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
    } else if (!response.success) {
      window.location.href = ""
    } else {
      self.setState({loading: false})
    }
  }

  requestKillItem = async () => {
    if (this.state.loading) return

    this.setState({loading: true})

    const self = this
    let res = await fetch("/api/moderation/killItem?id=" + this.state.item.id, {
      method: "GET"
    })

    window.location.href = ""
  }

  requestUnkillItem = async () => {
    if (this.state.loading) return

    this.setState({loading: true})

    const self = this
    let res = await fetch("/api/moderation/unkillItem?id=" + this.state.item.id, {
      method: "GET"
    })

    window.location.href = ""
  }

  render() {
    const item = this.state.item
    const currUsername = this.props.currUsername

    return (
      <div className={styles.item_details}>
        <table>
          <tbody>
            <tr>
              <td valign="top">
                {
                  item.by === currUsername ?
                  <div className={styles.item_star}>
                    <span>*</span>
                  </div> : null
                }
                {
                  item.by !== currUsername ?
                  <>
                    {
                      item.votedOnByUser || item.dead ?
                      <span className={[styles.item_upvote, styles.hide].join(' ')}></span> :
                      <span className={styles.item_upvote} onClick={() => this.requestUpvoteItem()}></span>
                    }
                  </> : null
                }
              </td>
              <td>
                <span className={styles.item_title}>
                  <a href={item.url ? item.url : `/item?id=${item.id}`}>
                    {item.dead ? "[dead] " : null}
                    {item.title}
                  </a>
                </span>
                {
                  item.url ?
                  <span className={styles.item_domain}>(<a href={`/from?site=${item.domain}`}>{item.domain}</a>)</span> : null
                }
              </td>
            </tr>
            <tr className={styles.item_details_bottom}>
              <td colSpan="1"></td>
              <td>
                <span>{item.points.toLocaleString()} {item.points === 1 ? "point" : "points"}</span>
                <span> by <a href={`/user?id=${item.by}`}>{item.by}</a> </span>
                <span><a href={`/item?id=${item.id}`}>{ renderCreatedTime(item.created) }</a> </span>
                {
                  item.votedOnByUser && !item.unvoteExpired && !item.dead ?
                  <>
                    <span> | </span>
                    <span className={styles.item_unvote} onClick={() => this.requestUnvoteItem()}>un-vote</span>
                  </> : null
                }
                {
                  !item.hiddenByUser ?
                  <>
                    <span> | </span>
                    <span className={styles.item_hide} onClick={() => this.requestHideItem()}>hide</span>
                  </> :
                  <>
                    <span> | </span>
                    <span className={styles.item_hide} onClick={() => this.requestUnhideItem()}>un-hide</span>
                  </>
                }
                <span> | </span>
                <span><a href={`/search?q=${item.title}`}>past</a></span>
                <span> | </span>
                <span><a href={`https://www.google.com/search?q=${item.title}`}>web</a></span>
                {
                  !item.favoritedByUser ?
                  <>
                    <span> | </span>
                    <span className={styles.item_favorite} onClick={() => this.requestFavoriteItem()}>favorite</span>
                  </> :
                  <>
                    <span> | </span>
                    <span className={styles.item_favorite} onClick={() => this.requestUnfavoriteItem()}>un-favorite</span>
                  </>
                }
                {
                  item.by === currUsername && !item.editAndDeleteExpired && !item.dead ?
                  <>
                    <span> | </span>
                    <span className={styles.item_edit}>
                      <a href={`/edit-item?id=${item.id}`}>edit</a>
                    </span>
                  </> : null
                }
                {
                  item.by === currUsername && !item.editAndDeleteExpired && !item.dead ?
                  <>
                    <span> | </span>
                    <span className={styles.item_delete}>
                      <a href={`/delete-item?id=${item.id}&goto=${encodeURIComponent(this.props.goToString)}`}>delete</a>
                    </span>
                  </> : null
                }
                {
                  this.props.isModerator && !item.dead ?
                  <>
                    <span> | </span>
                    <span className={styles.item_kill} onClick={() => this.requestKillItem()}>kill</span>
                  </> : null
                }
                {
                  this.props.isModerator && item.dead ?
                  <>
                    <span> | </span>
                    <span className={styles.item_kill} onClick={() => this.requestUnkillItem()}>un-kill</span>
                  </> : null
                }
                {
                  !item.dead ?
                  <>
                    {
                      item.commentCount > 0 ?
                      <>
                        <span> | </span>
                        <span className={styles.item_comments}>
                          <a href={`/item?id=${item.id}`}>{item.commentCount.toLocaleString()} comment{item.commentCount > 1 ? "s" : null}</a>
                        </span>
                      </> :
                      <>
                        <span> | </span>
                        <span className={styles.item_comments}>
                          <a href={`/item?id=${item.id}`}>discuss</a>
                        </span>
                      </>
                    }
                  </> : null
                }
              </td>
            </tr>
          </tbody>
        </table>
        {
          !item.url && item.text ?
          <div className={styles.item_text_content}>
            <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
          </div> : null
        }
        {
          !item.dead ?
          <>
            <div className={styles.item_comment_box}>
              <textarea
                type="text"
                value={this.state.commentInputValue}
                onChange={this.updateCommentInputValue}
              />
            </div>
            <div className={styles.item_add_comment_btn}>
              <input
                type="submit"
                value="add comment"
                onClick={() => this.requestAddNewComment()}
              />
            </div>
            {
              this.state.commentTextTooLongError ?
              <div className={styles.item_add_comment_error}>
                <span>Text exceeds limit of 5,000 characters.</span>
              </div> : null
            }
            {
              this.state.commentTextRequiredError ?
              <div className={styles.item_add_comment_error}>
                <span>Text is required.</span>
              </div> : null
            }
            {
              this.state.commentSubmitError ?
              <div className={styles.item_add_comment_error}>
                <span>An error occurred.</span>
              </div> : null
            }
          </> : null
        }
      </div>
    )
  }
}
