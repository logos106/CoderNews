import { Component } from "react"
import moment from "moment"

// import "../styles/pages/user.css"
import authUser from "../api/users/authUser.js"
import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import GoogleAnalytics from "../components/googleAnalytics.js"

import getUserData from "../api/users/getUserData.js"
import updateUserData from "../api/users/updateUserData.js"
import addUserShadowBan from "../api/moderation/addUserShadowBan.js"
import removeUserShadowBan from "../api/moderation/removeUserShadowBan.js"
import addUserBan from "../api/moderation/addUserBan.js"
import removeUserBan from "../api/moderation/removeUserBan.js"

export async function getServerSideProps (context) {
  const apiResult = await getUserData(context)
  const authResult = authUser(context)
  return {
    props: {
      username: context.query.id,
      userData: apiResult.user,
      showPrivateUserData: apiResult && apiResult.showPrivateUserData,
      authUserData: authResult ,
      getDataError: typeof apiResult.getDataError === 'undefined' ? false : apiResult.getDataError,
      notFoundError: typeof apiResult.notFoundError === 'undefined' ? false : apiResult.notFoundError,
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

  submitUpdateRequest = () => {
    if (this.state.loading) return

    this.setState({loading: true})

    const inputData = {
      id: this.props.userData.id,
      about: this.state.aboutInputValue,
      email: this.state.emailInputValue,
      showDead: this.state.showDeadValue === "yes" ? true : false
    }
    
    const self = this
    updateUserData(inputData, function(response) {
      if (response.submitError) {
        self.setState({
          loading: false,
          submitError: true
        })
      } else {
        window.location.href = ""
      }
    })
  }

  requestAddShadowBan = () => {
    if (this.state.loading) return

    this.setState({loading: true})

    addUserShadowBan(this.props.username, function(response) {
      window.location.href = ""
    })
  }

  requestRemoveShadowBan = () => {
    if (this.state.loading) return

    this.setState({loading: true})

    removeUserShadowBan(this.props.username, function(response) {
      window.location.href = ""
    })
  }

  requestAddUserBan = () => {
    if (this.state.loading) return

    this.setState({loading: true})

    addUserBan(this.props.username, function(response) {
      window.location.href = ""
    })
  }

  requestRemoveUserBan = () => {
    if (this.state.loading) return

    this.setState({loading: true})

    removeUserBan(this.props.username, function(response) {
      window.location.href = ""
    })
  }

  render () {
    return (
      <div className="layout-wrapper">
        <style jsx>{`
          .user-content-container {
            padding: 10px 5px 10px 5px;
          }
          
          .user-public-data {
            padding-bottom: 15px;
          }
          
          .user-add-email-address-msg {
            display: inline-block;
            background-color: rgb(255, 255, 170);
            color: #828282;
            font-size: 13.5px;
            margin-bottom: 10px;
            padding: 8px;
          }
          
          .user-item {
            width: 100%;
            font-size: 13.5px;
            margin-top: 5px;
            margin-bottom: 5px;
          }
          
          .user-item-label {
            display: inline-block;
            width: 80px;
            color: rgb(130, 130, 130);
          }
          
          .user-item-label.public {
            width: 70px;
          }
          
          .user-item-content {
            display: inline-block;
          }
          
          .user-item-content.about.public {
            width: 85%;
            margin-bottom: 10px;
            white-space: pre-line;
          }
          
          .user-item-content.about.public a {
            color: #000000;
            text-decoration: underline;
          }
          
          .user-item-content.about.public a:visited {
            color: #828282;
          }
          
          .user-item-content.username {
            color: rgb(130, 130, 130);
          }
          
          .user-item-content.created {
            color: #000000
          }
          
          .user-item-content.karma {
            color: rgb(130, 130, 130);
          }
          
          .user-item-label.about {
            height: 100%;
            vertical-align: top;
          }
          
          .user-item-content.about textarea {
            width: 500px;
            max-width: 98%;
            height: auto;
            vertical-align: middle;
            -webkit-writing-mode: horizontal-tb;
            text-rendering: auto;
            color: initial;
            letter-spacing: normal;
            word-spacing: normal;
            text-transform: none;
            text-indent: 0px;
            text-shadow: none;
            display: inline-block;
            text-align: start;
            -webkit-appearance: textarea;
            background-color: white;
            -webkit-rtl-ordering: logical;
            flex-direction: column;
            resize: auto;
            cursor: text;
            white-space: pre-wrap;
            overflow-wrap: break-word;
            box-sizing: border-box;
            margin: 0em;
            border-width: 1px;
            border-style: solid;
            border-color: rgb(169, 169, 169);
            border-image: initial;
            padding: 2px 0px 0px 2px;
          }
          
          .user-item-content.about textarea[type="text"] {
            font-family: monospace;
            font-size: 13.5px;
          }
          
          .user-item-about-help {
            vertical-align: bottom;
            margin-left: 2.5px;
          }
          
          .user-item-about-help a {
            text-decoration: none;
            font-size: 10px;
            color: rgb(175, 175, 175);;
          }
          
          .user-item-content input {
            height: 20px;
            -webkit-writing-mode: horizontal-tb;
            text-rendering: auto;
            color: initial;
            letter-spacing: normal;
            word-spacing: normal;
            text-transform: none;
            text-indent: 0px;
            text-shadow: none;
            display: inline-block;
            text-align: start;
            -webkit-appearance: textfield;
            background-color: white;
            -webkit-rtl-ordering: logical;
            cursor: text;
            margin: 0em;
            padding: 1px;
            border: 1px solid #a6a4a4;
          }
          
          .user-item-content select {
            background-color: buttonface;
            border-width: 1px;
            border-style: solid;
            border-color: rgb(169, 169, 169);
          }
          
          .user-item-content input[type="text"] {
            font-family: monospace;
            font-size: 13.5px;
          }
          
          .user-item-content.email input {
            width: 475px;
          }
          
          .user-item-content {
            color: #828282;
          }
          
          .user-item-content a,
          .user-item-content a:visited,
          .user-item-content a:link {
            color: #828282;
          }
          
          .user-submit-btn {
            margin-top: 20px;
            margin-bottom: 10px;
          }
          
          .user-submit-btn input {
            -webkit-appearance: push-button;
            user-select: none;
            white-space: pre;
            align-items: flex-start;
            text-align: center;
            cursor: default;
            color: buttontext;
            background-color: buttonface;
            box-sizing: border-box;
            padding: 1px 6px;
            border-width: 2px;
            border-style: outset;
            border-color: buttonface;
            border-image: initial;
          }
          
          .user-submit-btn input[type="submit"] {
            font-family: monospace;
            font-size: 13.5px;
          }
          
          .user-submit-btn input[type="submit"]:active {
            border-style: inset;
          }
          
          .user-submit-error-msg {
            color: #828282;
            font-size: 13.5px;
            margin: 12.5px 0px 5px 0px;
          }
          
          .user-moderator-section {
            margin-top: 35px;
          }
          
          .user-item-ban-btn {
            color: #b82727;
          }
          
          .user-item-ban-btn:hover {
            text-decoration: underline;
            cursor: pointer;
          }
          
          .user-get-data-error-msg {
            margin: 8px;
            font-size: 13.5px;
            color: #828282;
          }
          
          @media only screen and (max-width: 750px) and (min-width: 0px) {
            .user-item {
              font-size: 13px;
            }
          
            .user-item-label {
              width: 70px;
            }
          
            .user-item-content input[type="text"] {
              height: 24px;
              font-size: 16px;
            }
          
            .user-item-content.about textarea[type="text"] {
              font-size: 16px;
            }
          }
          
          @media only screen and (max-width: 600px) and (min-width: 500px) {
            .user-item-content.email input {
              width: 400px;
            }
          
            .user-item-content.about textarea {
              width: 390px;
            }
          }
          
          @media only screen and (max-width: 500px) and (min-width: 400px) {
            .user-item-content.about.public {
              width: 75%;
            }
          
            .user-item-content.email input {
              width: 300px;
            }
          
            .user-item-content.about textarea {
              width: 290px;
            }
          }
          
          @media only screen and (max-width: 400px) and (min-width: 0px) {
            .user-item-content.about.public {
              width: 75%;
            }
          
            .user-item-content.email input {
              width: 225px;
            }
          
            .user-item-content.about textarea {
              width: 215px;
            }
          }
        
        `}</style>
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
        <div className="user-content-container">
          {
            !this.props.getDataError && !this.props.notFoundError ?
            <>
              {
                this.props.showPrivateUserData ?
                <div className="user-private-data">
                  {
                    !this.props.userData.email ?
                    <div className="user-add-email-address-msg">
                      <span>Please put a valid address in the email field, or we won't be able to send you a new password if you forget yours. Your address is only visible to you and us. Crawlers and other users can't see it.</span>
                    </div> :
                    null
                  }
                  <div className="user-item">
                    <div className="user-item-label">
                      <span>user:</span>
                    </div>
                    <div className="user-item-content username">
                      <span>{this.props.userData.username}</span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label">
                      <span>created:</span>
                    </div>
                    <div className="user-item-content created">
                      <span>{moment.unix(this.props.userData.created).format("MMM D, YYYY")}</span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label">
                      <span>karma:</span>
                    </div>
                    <div className="user-item-content karma">
                      <span>{this.props.userData.karma.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label about">
                      <span>about:</span>
                    </div>
                    <div className="user-item-content about">
                      <textarea
                        cols={60}
                        rows={this.setInitialTextareaHeight()}
                        wrap="virtual"
                        type="text"
                        value={this.state.aboutInputValue}
                        onChange={this.updateAboutInputValue}
                      />
                      <span className="user-item-about-help"><a href="/formatdoc">help</a></span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label">
                      <span>email:</span>
                    </div>
                    <div className="user-item-content email">
                      <input
                        type="text"
                        value={this.state.emailInputValue}
                        onChange={this.updateEmailInputValue}
                      />
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label">
                      <span>showdead:</span>
                    </div>
                    <div className="user-item-content email">
                      <select value={this.state.showDeadValue} onChange={this.updateShowDeadValue}>
                        <option value="no">no</option>
                        <option value="yes">yes</option>
                      </select>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label">
                      <span></span>
                    </div>
                    <div className="user-item-content">
                      <span><a href="/changepw">change password</a></span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label">
                      <span></span>
                    </div>
                    <div className="user-item-content">
                      <span><a href={`/submitted?id=${this.props.username}`}>submissions</a></span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label">
                      <span></span>
                    </div>
                    <div className="user-item-content">
                      <span><a href={`/threads?id=${this.props.username}`}>comments</a></span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label">
                      <span></span>
                    </div>
                    <div className="user-item-content">
                      <span><a href={`/hidden`}>hidden</a></span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label">
                      <span></span>
                    </div>
                    <div className="user-item-content">
                      <span><a href={`/upvoted?id=${this.props.username}`}>upvoted items</a></span>
                      <span> / </span>
                      <span><a href={`/upvoted?id=${this.props.username}&comments=t`}>comments</a></span>
                      <span> <i>(private)</i></span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label">
                      <span></span>
                    </div>
                    <div className="user-item-content">
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
                    <div className="user-submit-error-msg">
                      <span>An error occurred.</span>
                    </div> : null
                  }
                </div> :
                <div className="user-public-data">
                  <div className="user-item">
                    <div className="user-item-label public">
                      <span>user:</span>
                    </div>
                    <div className="user-item-content username">
                      <span>{this.props.userData.username}</span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label public">
                      <span>created:</span>
                    </div>
                    <div className="user-item-content created">
                      <span>{moment.unix(this.props.userData.created).format("MMM D, YYYY")}</span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label public">
                      <span>karma:</span>
                    </div>
                    <div className="user-item-content karma">
                      <span>{this.props.userData.karma.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label about public">
                      <span>about:</span>
                    </div>
                    <div className="user-item-content about public">
                      <span dangerouslySetInnerHTML={{ __html: this.props.userData.about }}></span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label public">
                      <span></span>
                    </div>
                    <div className="user-item-content">
                      <span><a href={`/submitted?id=${this.props.username}`}>submissions</a></span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label public">
                      <span></span>
                    </div>
                    <div className="user-item-content">
                      <span><a href={`/threads?id=${this.props.username}`}>comments</a></span>
                    </div>
                  </div>
                  <div className="user-item">
                    <div className="user-item-label public">
                      <span></span>
                    </div>
                    <div className="user-item-content">
                      <span><a href={`/favorites?id=${this.props.username}`}>favorites</a></span>
                    </div>
                  </div>
                  {
                    this.props.authUserData.isModerator ?
                    <div className="user-moderator-section">
                      {
                        !this.props.userData.shadowBanned ?
                        <div className="user-item moderator-section">
                          <div className="user-item-content">
                            <span className="user-item-ban-btn" onClick={() => this.requestAddShadowBan()}>Shadow-Ban</span>
                            <span> (User item and comment submissions get automatically killed)</span>
                          </div>
                        </div> :
                        <div className="user-item">
                          <div className="user-item-content">
                            <span>Shadow-Banned (</span>
                            <span className="user-item-ban-btn" onClick={() => this.requestRemoveShadowBan()}>Remove</span>
                            <span>)</span>
                          </div>
                        </div>
                      }
                      {
                        !this.props.userData.banned ?
                        <div className="user-item moderator-section">
                          <div className="user-item-content">
                            <span className="user-item-ban-btn" onClick={() => this.requestAddUserBan()}>Ban</span>
                            <span> (User login and authentication will be revoked)</span>
                          </div>
                        </div> :
                        <div className="user-item">
                          <div className="user-item-content">
                            <span>Banned (</span>
                            <span className="user-item-ban-btn" onClick={() => this.requestRemoveUserBan()}>Remove</span>
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
