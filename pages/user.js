import { Component } from "react"
import moment from "moment"
import authUser from "../api/users/authUser.js"
import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import getUserData from "../api/users/getUserData.js"

import styles from "../styles/pages/user.module.css"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)

  const username = context.query.id
  const result = await getUserData(username, authResult)

  return {
    props: {
      authUserData: authResult ,
      username: context.query.id,
      userData: typeof result.user === 'undefined' ? null : result.user,
      showPrivateUserData: typeof result.showPrivateUserData === 'undefined' ? false : result.showPrivateUserData,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      notFoundError: typeof result.notFoundError === 'undefined' ? false : result.notFoundError,
      goToString: `user?id=${context.query.id}`
    }
  }
}

export default class extends Component {

  constructor(props) {
    super(props)
    this.state = {
      aboutInputValue: this.props.userData ? this.props.userData.about : "",
      emailInputValue:  this.props.userData ? this.props.userData.email : "",
      showDeadValue: this.props.userData && this.props.userData.showDead ? "yes" : "no",
      isModerator: this.props.userData && this.props.userData.is_moderator,
      loading: false,
      submitError: false
    }
  }

  setInitialTextareaHeight = () => {
    if (this.props.userData.about) {
      const numOfLines = this.props.userData.about.split(/\r\n|\r|\n/).length

      return numOfLines + 3
    } else {
      return 6
    }
  }

  updateAboutInputValue = (event) => {
    this.setState({aboutInputValue: event.target.value})
  }

  updateEmailInputValue = (event) => {
    this.setState({emailInputValue: event.target.value})
  }

  updateShowDeadValue = (event) => {
    this.setState({showDeadValue: event.target.value})
  }

  submitUpdateRequest = async () => {
    if (this.state.loading) return

    this.setState({loading: true})

    const inputData = {
      id: this.props.userData.id,
      about: this.state.aboutInputValue,
      email: this.state.emailInputValue,
      showDead: this.state.showDeadValue === "yes" ? true : false
    }

    const self = this

    let res = await fetch("/api/updateUserData", {
      method: "POST",
      body: JSON.stringify(inputData)
    })
    let response = await res.json()

    if (response.submitError) {
      self.setState({
        loading: false,
        submitError: true
      })
    } else {
      window.location.href = ""
    }
  }

  requestAddShadowBan = async () => {
    if (this.state.loading) return

    this.setState({loading: true})

    let res = await fetch("/api/moderation/addShadowBan?user=" + this.props.username, {
      method: "GET"
    })

    let response = await res.json()

    window.location.href = ""

  }

  requestRemoveShadowBan = async () => {
    if (this.state.loading) return

    this.setState({loading: true})

    let res = await fetch("/api/moderation/removeShadowBan?user=" + this.props.username, {
      method: "GET"
    })

    let response = await res.json()

    window.location.href = ""
  }

  requestAddUserBan = async () => {
    if (this.state.loading) return

    this.setState({loading: true})

    let res = await fetch("/api/moderation/addBan?user=" + this.props.username, {
      method: "GET"
    })

    let response = await res.json()

    window.location.href = ""
  }

  requestRemoveUserBan = async () => {
    if (this.state.loading) return

    this.setState({loading: true})

    let res = await fetch("/api/moderation/removeBan?user=" + this.props.username, {
      method: "GET"
    })

    let response = await res.json()

    window.location.href = ""
  }

  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title={this.props.userData ? `Profile: ${this.props.username} | Coder News` : "User Profile | Coder News"}
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData.userSignedIn}
          username={this.props.authUserData.username}
          karma={this.props.authUserData.karma}
          goto={this.props.goToString}
        />
      <div className={styles.user_content_container}>
          {
            !this.props.getDataError && !this.props.notFoundError ?
            <>
              {
                this.props.showPrivateUserData ?
                <div className={styles.user_private_data}>
                  {
                    !this.props.userData.email ?
                    <div className={styles.user_add_email_address_msg}>
                      <span>Please put a valid address in the email field, or we won't be able to send you a new password if you forget yours. Your address is only visible to you and us. Crawlers and other users can't see it.</span>
                    </div> :
                    null
                  }
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label}>
                      <span>user:</span>
                    </div>
                    <div className={styles.user_item, styles.user_item_content, styles.username}>
                      <span>{this.props.userData.username}</span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label}>
                      <span>created:</span>
                    </div>
                    <div className={styles.user_item, styles.user_item_content, styles.created}>
                      <span>{moment.unix(this.props.userData.created).format("MMM D, YYYY")}</span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label}>
                      <span>karma:</span>
                    </div>
                    <div className={styles.user_item, styles.user_item_content, styles.karma}>
                      <span>{this.props.userData.karma.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label, styles.about}>
                      <span>about:</span>
                    </div>
                    <div className={styles.user_item, styles.user_item_content, styles.about}>
                      <textarea
                        cols={60}
                        rows={this.setInitialTextareaHeight()}
                        wrap="virtual"
                        type="text"
                        value={this.state.aboutInputValue}
                        onChange={this.updateAboutInputValue}
                      />
                    <span className={styles.user_item, styles.user_item_about_help}><a href="/formatdoc">help</a></span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label}>
                      <span>email:</span>
                    </div>
                    <div className={styles.user_item, styles.user_item_content, styles.email}>
                      <input
                        type="text"
                        value={this.state.emailInputValue}
                        onChange={this.updateEmailInputValue}
                      />
                    </div>
                  </div>
                  {
                    this.state.isModerator ?
                      <div className={styles.user_item}>
                        <div className={styles.user_item, styles.user_item_label}>
                          <span>showdead:</span>
                        </div>
                        <div className={styles.user_item, styles.user_item_content, styles.email}>
                          <select value={this.state.showDeadValue} onChange={this.updateShowDeadValue}>
                            <option value="no">no</option>
                            <option value="yes">yes</option>
                          </select>
                        </div>
                      </div>
                      : null
                  }
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label}>
                      <span></span>
                    </div>
                    <div className={styles.user_item_content}>
                      <span><a href="/changepw">change password</a></span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label}>
                      <span></span>
                    </div>
                    <div className={styles.user_item_content}>
                      <span><a href={`/submitted?id=${this.props.username}`}>submissions</a></span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label}>
                      <span></span>
                    </div>
                    <div className={styles.user_item_content}>
                      <span><a href={`/threads?id=${this.props.username}`}>comments</a></span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label}>
                      <span></span>
                    </div>
                    <div className={styles.user_item_content}>
                      <span><a href={`/hidden`}>hidden</a></span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label}>
                      <span></span>
                    </div>
                    <div className={styles.user_item_content}>
                      <span><a href={`/upvoted?id=${this.props.username}`}>upvoted items</a></span>
                      <span> / </span>
                      <span><a href={`/upvoted?id=${this.props.username}&comments=t`}>comments</a></span>
                      <span> <i>(private)</i></span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label}>
                      <span></span>
                    </div>
                    <div className={styles.user_item_content}>
                      <span><a href={`/favorites?id=${this.props.username}`}>favorite items</a></span>
                      <span> / </span>
                      <span><a href={`/favorites?id=${this.props.username}&comments=t`}>comments</a></span>
                      <span> <i>(shared)</i></span>
                    </div>
                  </div>
                  <div className="user-submit-btn">
                    <input
                      type="submit"
                      value="update"
                      onClick={() => this.submitUpdateRequest()}
                    />
                  </div>
                  {
                    this.state.submitError ?
                    <div className={styles.user_submit_error_msg}>
                      <span>An error occurred.</span>
                    </div> : null
                  }
                </div> :
                <div className={styles.user_public_data}>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label, styles.public}>
                      <span>user:</span>
                    </div>
                    <div className={styles.user_item, styles.user_item_content, styles.username}>
                      <span>{this.props.userData.username}</span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label, styles.public}>
                      <span>created:</span>
                    </div>
                    <div className={styles.user_item, styles.user_item_content, styles.created}>
                      <span>{moment.unix(this.props.userData.created).format("MMM D, YYYY")}</span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label, styles.public}>
                      <span>karma:</span>
                    </div>
                    <div className={styles.user_item, styles.user_item_content, styles.karma}>
                      <span>{this.props.userData.karma.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label, styles.about, styles.public}>
                      <span>about:</span>
                    </div>
                    <div className={styles.user_item, styles.user_item_content, styles.about, styles.public}>
                      <span dangerouslySetInnerHTML={{ __html: this.props.userData.about }}></span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label, styles.public}>
                      <span></span>
                    </div>
                    <div className={styles.user_item_content}>
                      <span><a href={`/submitted?id=${this.props.username}`}>submissions</a></span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label, styles.public}>
                      <span></span>
                    </div>
                    <div className={styles.user_item_content}>
                      <span><a href={`/threads?id=${this.props.username}`}>comments</a></span>
                    </div>
                  </div>
                  <div className={styles.user_item}>
                    <div className={styles.user_item, styles.user_item_label, styles.public}>
                      <span></span>
                    </div>
                    <div className={styles.user_item_content}>
                      <span><a href={`/favorites?id=${this.props.username}`}>favorites</a></span>
                    </div>
                  </div>
                  {
                    this.props.authUserData.isModerator ?
                    <div className={styles.user_moderator_section}>
                      {
                        !this.props.userData.shadowBanned ?
                        <div className={styles.user_item, styles.moderator_section}>
                          <div className={styles.user_item_content}>
                            <span className={styles.user_item, styles.user_item_ban_btn} onClick={() => this.requestAddShadowBan()}>Shadow-Ban</span>
                            <span> (User item and comment submissions get automatically killed)</span>
                          </div>
                        </div> :
                        <div className={styles.user_item}>
                          <div className={styles.user_item_content}>
                            <span>Shadow-Banned (</span>
                            <span className={styles.user_item, styles.user_item_ban_btn} onClick={() => this.requestRemoveShadowBan()}>Remove</span>
                            <span>)</span>
                          </div>
                        </div>
                      }
                      {
                        !this.props.userData.banned ?
                        <div className={styles.user_item, styles.moderator_section}>
                          <div className={styles.user_item_content}>
                            <span className={styles.user_item, styles.user_item_ban_btn} onClick={() => this.requestAddUserBan()}>Ban</span>
                            <span> (User login and authentication will be revoked)</span>
                          </div>
                        </div> :
                        <div className={styles.user_item}>
                          <div className={styles.user_item_content}>
                            <span>Banned (</span>
                            <span className={styles.user_item, styles.user_item_ban_btn} onClick={() => this.requestRemoveUserBan()}>Remove</span>
                            <span>)</span>
                          </div>
                        </div>
                      }
                    </div> : null
                  }
                </div>
              }
            </> :
            <div className="user-get-data-error-msg">
              {
                this.props.notFoundError ?
                <span>User not found.</span> :
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
