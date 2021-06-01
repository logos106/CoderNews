import { Component } from "react"
import authUser from "../../api/users/authUser.js"
import AlternateHeader from "../../components/alternateHeader.js"
import HeadMetadata from "../../components/headMetadata.js"
import GoogleAnalytics from "../../components/googleAnalytics.js"
import getBannedUsersByPage from "../../api/moderation/getBannedUsersByPage.js"

import styles from "../../styles/pages/moderation/banned-users.module.css"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)

  const page = query.page ? parseInt(context.query.page) : 1
  const result = await getBannedUsersByPage(page, authResult)

  return {
    props: {
      authUserData: authResult,
      users: typeof result.users === 'undefined' ? null : result.users,
      page: page,
      isMore: typeof result.isMore === 'undefined' ? false : result.isMore,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      notAllowedError: typeof result.notAllowedError === 'undefined' ? false : result.notAllowedError,
    }
  }
}

export default class extends Component {
  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title="Banned Users | Coder News"
        />
        <GoogleAnalytics />
        <AlternateHeader
          displayMessage="Banned Users"
        />
        <div className="moderation-banned-users-content-container">
          {
            !this.props.getDataError && !this.props.notAllowedError ?
            <>
              {
                this.props.users.length ?
                <div className="moderation-banned-users-table">
                  <table>
                    <tbody>
                      <tr className="moderation-banned-users-table-header">
                        <td>Username</td>
                      </tr>
                      {
                        this.props.users.map((user, index) => {
                          return (
                            <tr key={index}>
                              <td>
                                <a href={`/user?id=${user.username}`}>{user.username}</a>
                              </td>
                            </tr>
                          )
                        })
                      }
                      {
                        this.props.isMore ?
                        <div className="moderation-banned-users-more">
                          <a href={`/moderation/banned-users?page=${this.props.page + 1}`}>
                            <span>More</span>
                          </a>
                        </div> : null
                      }
                    </tbody>
                  </table>
                </div> :
                <>
                  <span>None found.</span>
                </>
              }
            </> :
            <div className="moderation-banned-users-error-msg">
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
