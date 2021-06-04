import { Component } from "react"

import HeadMetadata from "../components/headMetadata.js"
import AlternateHeader from "../components/alternateHeader.js"
import GoogleAnalytics from "../components/googleAnalytics.js"

import authUser from "../api/users/authUser.js"
import changePassword from "../api/users/changePassword.js"

import styles from "../styles/pages/changepw.module.css"

export async function getServerSideProps (context) {
  const authResult = await authUser(context.req, context.res)
  if (!authResult.userSignedIn) {
    context.res.writeHead(302, {
      Location: "/login?goto=changepw"
    })

    context.res.end()
  }

  return {
    props: {
      userContainsEmail: typeof authResult.email === 'undefined' ? '' : authResult.email,
      username: typeof authResult.username === 'undefined' ? '' : authResult.username
    }
  }
}

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentInputValue: "",
      newInputValue: "",
      loading: false,
      invalidCurrentPassword: false,
      newPasswordLengthError: false,
      submitError: false
    }
  }

  updateCurrentInputValue = (event) => {
    this.setState({currentInputValue: event.target.value})
  }

  updateNewInputValue = (event) => {
    this.setState({newInputValue: event.target.value})
  }

  submitRequest = async () => {
    if (this.state.loading) return

    const currentPassword = this.state.currentInputValue
    const newPassword = this.state.newInputValue

    if (!currentPassword) {
      this.setState({
        invalidCurrentPassword: true,
        newPasswordLengthError: false,
        submitError: false
      })
    } else if (newPassword.length < 8) {
      this.setState({
        invalidCurrentPassword: false,
        newPasswordLengthError: true,
        submitError: false
      })
    } else {
      this.setState({loading: true})

      const self = this

      let res = await fetch("/api/changePassword", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        })
      })

      let response = await res.json()
      if (response.authError) {
        window.location.href = "/login?goto=changepw"
      } else if (response.newPasswordLengthError) {
        self.setState({
          loading: false,
          invalidCurrentPassword: false,
          newPasswordLengthError: true,
          submitError: false
        })
      } else if (response.invalidCurrentPassword) {
        self.setState({
          loading: false,
          invalidCurrentPassword: true,
          newPasswordLengthError: false,
          submitError: false
        })
      } else if (response.submitError || !response.success) {
        self.setState({
          loading: false,
          invalidCurrentPassword: false,
          newPasswordLengthError: false,
          submitError: true
        })
      } else {
        window.location.href = "/login"
      }
    }
  }

  render () {
    return (
      <div className={styles.layout_wrapper}>
        <HeadMetadata
          title="Change Password | Coder News"
        />
        <GoogleAnalytics />
        <AlternateHeader
          displayMessage={`Change Password for ${this.props.username}`}
        />
      <div className={styles.changepw_content_container}>
          {
            !this.props.userContainsEmail ?
            <div className={styles.changepw_error_msg}>
              <span>First, please put a valid email address in your <a href={`/user?id=${this.props.username}`}>profile</a>. Otherwise you could lose your account if you mistype your new password.</span>
            </div> : null
          }
          {
            this.state.invalidCurrentPassword ?
            <div className={styles.changepw_error_msg}>
              <span>Invalid current password.</span>
            </div> : null
          }
          {
            this.state.newPasswordLengthError ?
            <div className={styles.changepw_error_msg}>
              <span>Passwords should be at least 8 characters.</span>
            </div> : null
          }
          {
            this.state.submitError ?
            <div className={styles.changepw_error_msg}>
              <span>An error occurred.</span>
            </div> : null
          }
          <div className={styles.changepw_input_item}>
            <div className={styles.changepw_input_item_label}>
              <span>Current Password:</span>
            </div>
            <div className={styles.changepw_input_item_input}>
              <input
                type="password"
                value={this.state.currentInputValue}
                onChange={this.updateCurrentInputValue}
              />
            </div>
          </div>
          <div className={styles.changepw_input_item}>
            <div className={styles.changepw_input_item_label}>
              <span>New Password:</span>
            </div>
            <div className={styles.changepw_input_item_input}>
              <input
                type="password"
                value={this.state.newInputValue}
                onChange={this.updateNewInputValue}
              />
            </div>
          </div>
          <div className={styles.changepw_submit_btn}>
            <input
              type="submit"
              value="Change"
              onClick={() => this.submitRequest()}
            />
          </div>
        </div>
      </div>
    )
  }
}
