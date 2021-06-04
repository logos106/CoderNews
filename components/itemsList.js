import { Component } from "react"
import Link from 'next/link'
import renderCreatedTime from "../utils/renderCreatedTime.js"

import styles from "../styles/components/itemsList.module.css"

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: this.props.items,
      loading: false
    }
  }

  requestUpvoteItem = async (itemId, itemIndexPosition) => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      this.state.items[itemIndexPosition].votedOnByUser = true
      this.forceUpdate()

      const self = this

      let res = await fetch("/api/items/upvote?id=" + itemId, {method: "GET"})
      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        self.setState({loading: false })
        this.state.items[itemIndexPosition].points = response.points
        this.forceUpdate()
      }
    }
  }

  requestUnvoteItem = async (itemId, itemIndexPosition) => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      this.state.items[itemIndexPosition].votedOnByUser = false
      this.forceUpdate()

      const self = this

      let res = await fetch("/api/items/unvote?id=" + itemId, {method: "GET"})
      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        self.setState({loading: false})
        this.state.items[itemIndexPosition].points = response.points
        this.forceUpdate()
      }
    }
  }

  requestUnfavoriteItem = async (itemId) => {
    if (this.state.loading) return

    const self = this

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {

      let res = await fetch("/api/items/unfavorite?id=" + itemId, {method: "GET"})
      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        window.location.href = ""
      }
    }
  }

  requestHideItem = async (itemId, itemIndexPosition) => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      for (let i = 0; i < this.state.items.length; i++) {
        if (i > itemIndexPosition) {
          this.state.items[i].rank -= 1
        }
      }

      this.state.items.splice(itemIndexPosition, 1)
      this.forceUpdate()

      const self = this

      let res = await fetch("/api/items/hide?id=" + itemId, {method: "GET"})
      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        self.setState({loading: false})
      }
    }
  }

  requestUnhideItem = async (itemId) => {
    if (this.state.loading) return

    if (!this.props.userSignedIn) {
      window.location.href = `/login?goto=${encodeURIComponent(this.props.goToString)}`
    } else {
      this.setState({loading: true})

      const self = this

      let res = await fetch("/api/items/unhide?id=" + itemId, {method: "GET"})
      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${encodeURIComponent(self.props.goToString)}`
      } else {
        window.location.href = ""
      }

    }
  }

  requestKillItem = async (itemId) => {
    if (this.state.loading) return

    this.setState({loading: true})

    const self = this
    let res = await fetch("/api/moderation/killItem?id=" + itemId, {
      method: "GET"
    })

    window.location.href = ""
  }

  requestUnkillItem = async (itemId) => {
    if (this.state.loading) return

    this.setState({loading: true})

    const self = this
    let res = await fetch("/api/moderation/unkillItem?id=" + itemId, {
      method: "GET"
    })

    window.location.href = ""
  }

  render() {
    return (
      <>
        {
          this.state.items ?
          this.state.items.map((item, index) => {
            return (
              <div key={item.id} className={styles.listed_item_container}>
                <table>
                  <tbody>
                    <tr>
                      <td className={this.props.showRank ? styles.listed_item_rank : [styles.listed_item_rank, styles.hide].join(' ')}>
                        {
                          this.props.showRank ?
                          <span>{item.rank}.</span> : null
                        }
                      </td>
                      <td valign="top">
                        {
                          this.props.currUsername === item.by ?
                          <div className={styles.listed_item_star}>
                            <span>*</span>
                          </div> : null
                        }
                        {
                          this.props.currUsername !== item.by ?
                          <>
                            {
                              item.votedOnByUser || item.dead ?
                              <span className={[styles.listed_item_upvote, styles.hide].join(' ')}></span> :
                              <span className={styles.listed_item_upvote} onClick={() => this.requestUpvoteItem(item.id, index)}></span>
                            }
                          </> : null
                        }
                      </td>
                      <td>
                        <span className={styles.listed_item_title}>
                          <Link href={item.url ? item.url : `/item?id=${item.id}`}>
                            <a>
                              {item.dead ? "[dead] " : null}
                              {item.title}
                            </a>
                          </Link>
                        </span>
                        {
                          item.url ?
                          <span className={styles.listed_item_domain}>(<a href={`/from?site=${item.domain}`}>{item.domain}</a>)</span> : null
                        }
                      </td>
                    </tr>
                    <tr className={styles.listed_item_bottom_section}>
                      <td colSpan="2"></td>
                      <td>
                        <span>{item.points.toLocaleString()} {item.points === 1 ? "point" : "points"}</span>
                        <span> by <a href={`/user?id=${item.by}`}>{item.by}</a> </span>
                        <span className={styles.listed_item_time}><a href={`/item?id=${item.id}`}>{renderCreatedTime(item.created)}</a> </span>
                        {
                          this.props.showPastLink ?
                          <>
                            <span> | </span>
                            <span><a href={`/search?q=${item.title}`}>past</a></span>
                          </> : null
                        }
                        {
                          this.props.showWebLink ?
                          <>
                            <span> | </span>
                            <span><a href={`https://www.google.com/search?q=${item.title}`}>web</a></span>
                          </> : null
                        }
                        {
                          item.votedOnByUser && !item.unvoteExpired && !item.dead ?
                          <>
                            <span> | </span>
                            <span className={styles.listed_item_unvote} onClick={() => this.requestUnvoteItem(item.id, index)}>un-vote</span>
                          </> : null
                        }
                        {
                          this.props.showUnfavoriteOption ?
                          <>
                            <span> | </span>
                            <span className={styles.listed_item_unfavorite} onClick={() => this.requestUnfavoriteItem(item.id)}>un-favorite</span>
                          </> : null
                        }
                        {
                          this.props.showHideOption ?
                          <>
                            <span> | </span>
                            <span className={styles.listed_item_hide} onClick={() => this.requestHideItem(item.id, index)}>hide</span>
                          </> : null
                        }
                        {
                          this.props.showUnhideOption ?
                          <>
                            <span> | </span>
                            <span className={styles.listed_item_unhide} onClick={() => this.requestUnhideItem(item.id)}>un-hide</span>
                          </> : null
                        }
                        {
                          item.by === this.props.currUsername && !item.editAndDeleteExpired && !item.dead ?
                          <>
                            <span> | </span>
                            <span>
                              <Link href={`/edit-item?id=${item.id}`}>
                                <a>edit</a>
                              </Link>
                            </span>
                          </> : null
                        }
                        {
                          item.by === this.props.currUsername && !item.editAndDeleteExpired && !item.dead ?
                          <>
                            <span> | </span>
                            <span>
                              <a href={`/delete-item?id=${item.id}&goto=${encodeURIComponent(this.props.goToString)}`}>delete</a>
                            </span>
                          </> : null
                        }
                        {
                          this.props.isModerator && !item.dead ?
                          <>
                            <span> | </span>
                            <span className={styles.listed_item_kill} onClick={() => this.requestKillItem(item.id)}>kill</span>
                          </> : null
                        }
                        {
                          this.props.isModerator && item.dead ?
                          <>
                            <span> | </span>
                            <span className={styles.listed_item_kill} onClick={() => this.requestUnkillItem(item.id)}>un-kill</span>
                          </> : null
                        }
                        {
                          !item.dead ?
                          <>
                            {
                              item.comment_count > 0 ?
                              <>
                                <span> | </span>
                                <span className={styles.listed_item_comments}>
                                  <a href={`/item?id=${item.id}`}>
                                    {item.comment_count.toLocaleString("en")} comment{item.comment_count > 1 ? "s" : null}
                                  </a>
                                </span>
                              </> :
                              <>
                                <span> | </span>
                                <span className={styles.listed_item_comments}><a href={`/item?id=${item.id}`}>discuss</a></span>
                              </>
                            }
                          </> : null
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          }) : null
        }
        {
          this.props.isMore ?
          <div className={this.props.showRank ? styles.listed_item_more : [styles.listed_item_more, styles.hide-rank].join(' ')}>
            <a href={this.props.isMoreLink}>
              <span>More</span>
            </a>
          </div> : null
        }
      </>
    )
  }
}
