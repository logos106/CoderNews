import { Component } from "react"
import authUser from "../../api/users/authUser.js"
import AlternateHeader from "../../components/alternateHeader.js"
import HeadMetadata from "../../components/headMetadata.js"
import GoogleAnalytics from "../../components/googleAnalytics.js"
import renderCreatedTime from "../../utils/renderCreatedTime.js"
import truncateItemTitle from "../../utils/truncateItemTitle.js"
import getModerationLogsByPage from "../../api/moderation/getModerationLogsByPage.js"

import styles from "../../styles/pages/moderation/logs.module.css"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)

  const category = context.query.category ? context.query.category : "all"
  const page = context.query.page ? parseInt(context.query.page) : 1
  const result = await getModerationLogsByPage(category, page, authResult)

  return {
    props: {
      authUserData: authResult,
      logs: typeof result.logs === 'undefined' ? null : result.logs,
      category: typeof result.category === 'undefined' ? null : result.category,
      page: page,
      isMore: typeof result.isMore === 'undefined' ? false : result.isMore,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      notAllowedError: typeof result.notAllowedError === 'undefined' ? false : result.notAllowedError,
    }
  }
}

export default class extends Component {
  updateFilterOptionValue = (event) => {
    window.location.href = `/moderation/logs?category=${event.target.value}`
  }

  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title="Moderation Logs | Coder News"
        />
        <GoogleAnalytics />
        <AlternateHeader
          displayMessage="Moderation Logs"
        />
        <div className="moderation-logs-content-container">
          {
            !this.props.getDataError && !this.props.notAllowedError ?
            <>
              <div className="moderation-filters">
                <span className="moderation-filter-label">Filter by category: </span>
                <select value={this.props.category} onChange={this.updateFilterOptionValue}>
                  <option value="all">all</option>
                  <option value="users">users</option>
                  <option value="items">items</option>
                  <option value="comments">comments</option>
                </select>
              </div>
              {
                this.props.logs.length ?
                <div className="moderation-logs-table">
                  <table>
                    <tbody>
                      <tr>
                        <td>Date</td>
                        <td>Moderator</td>
                        <td>Description</td>
                      </tr>
                      {
                        this.props.logs.map((log, index) => {
                          return (
                            <tr key={index}>
                              <td>{renderCreatedTime(log.created)}</td>
                              <td>
                                <a href={`/user?id=${log.moderatorUsername}`}>{log.moderatorUsername}</a>
                              </td>
                              <td>
                                {
                                  log.actionType === "add-user-shadow-ban" ?
                                  <span>
                                    Shadow ban added for user: <a href={`/user?id=${log.username}`}>{log.username}</a>.
                                  </span> : null
                                }
                                {
                                  log.actionType === "remove-user-shadow-ban" ?
                                  <span>
                                    Removed shadow ban for user: <a href={`/user?id=${log.username}`}>{log.username}</a>.
                                  </span> : null
                                }
                                {
                                  log.actionType === "add-user-ban" ?
                                  <span>
                                    Banned user: <a href={`/user?id=${log.username}`}>{log.username}</a>.
                                  </span> : null
                                }
                                {
                                  log.actionType === "remove-user-ban" ?
                                  <span>
                                    Removed ban for user: <a href={`/user?id=${log.username}`}>{log.username}</a>.
                                  </span> : null
                                }
                                {
                                  log.actionType === "kill-item" ?
                                  <span>
                                    Killed item <a href={`/item?id=${log.itemId}`}>{truncateItemTitle(log.itemTitle)}</a> by <a href={`/user?id=${log.itemBy}`}>{log.itemBy}</a>.
                                  </span> : null
                                }
                                {
                                  log.actionType === "unkill-item" ?
                                  <span>
                                    Unkilled item <a href={`/item?id=${log.itemId}`}>{truncateItemTitle(log.itemTitle)}</a> by <a href={`/user?id=${log.itemBy}`}>{log.itemBy}.</a>
                                  </span> : null
                                }
                                {
                                  log.actionType === "kill-comment" ?
                                  <span>
                                    Killed <a href={`/comment?id=${log.commentId}`}>comment</a> by <a href={`/user?id=${log.commentBy}`}>{log.commentBy}</a> on <a href={`/item?id=${log.itemId}`}>{truncateItemTitle(log.itemTitle)}</a>.
                                  </span> : null
                                }
                                {
                                  log.actionType === "unkill-comment" ?
                                  <span>
                                    Unkilled <a href={`/comment?id=${log.commentId}`}>comment</a> by <a href={`/user?id=${log.commentBy}`}>{log.commentBy}</a> on <a href={`/item?id=${log.itemId}`}>{truncateItemTitle(log.itemTitle)}</a>.
                                  </span> : null
                                }
                              </td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </table>
                </div> :
                <>
                  <span>None found.</span>
                </>
              }
              {
                this.props.isMore ?
                <div className="moderation-logs-more">
                  <a href={`/moderation/logs?category=${this.props.category}&page=${this.props.page + 1}`}>
                    <span>More</span>
                  </a>
                </div> : null
              }
            </> :
            <div className="moderation-logs-error-msg">
              {
                this.props.getDataError ?
                <span>An error occurred.</span> : null
              }
              {
                this.props.notAllowedError ?
                <span>You can’t see that.</span> : null
              }
            </div>
          }
        </div>
      </div>
    )
  }
}
