import { Component } from "react"
import HeadMetadata from "../components/headMetadata.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import Link from 'next/link'
import createNewUser from "../api/users/createNewUser.js"
import authUser from "../api/users/authUser.js"
import removeUserCookieData from "../api/users/removeUserCookieData.js"
import Router from "next/router"

import styles from '../styles/pages/login.module.css';

export async function getServerSideProps(context) {
  return {
    props: {
      goto: context.query.goto ? decodeURIComponent(context.query.goto) : ""
    }
  }
}

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,

      // login
      loginUseremailInputValue: "",
      loginPasswordInputValue: "",
      loginCredentialError: false,
      loginSubmitError: false,
      bannedError: false,

      //create account
      createAccountUsernameInputValue: "",
      createAccountUseremailInputValue: "",
      createAcountPasswordInputValue: "",
      UsernameExistsError: false,
      EmailExistsError: false,
      UsernameLengthError: false,
      EmailInvalidError: false,
      PasswordLengthError: false,
      createAccountSubmitError: false
    }
  }

  componentDidMount() {
    //removeUserCookieData()
  }

  updateLoginUseremailInputValue = (event) => {
    this.setState({loginUseremailInputValue: event.target.value})
  }

  updateLoginPasswordInputValue = (event) => {
    this.setState({loginPasswordInputValue: event.target.value})
  }

  updateCreateAccountUsernameInputValue = (event) => {
    this.setState({createAccountUsernameInputValue: event.target.value})
  }

  updateCreateAccountUseremailInputValue = (event) => {
    this.setState({createAccountUseremailInputValue: event.target.value})
  }

  updateCreateAccountPasswordInputValue = (event) => {
    this.setState({createAcountPasswordInputValue: event.target.value})
  }

  submitLogin = async () => {
    if (this.state.loading) return

    const useremail = this.state.loginUseremailInputValue
    const password = this.state.loginPasswordInputValue

    if (useremail.length === 0 || password.length === 0) {
      this.setState({
        loginCredentialError: true,
        loginSubmitError: false,
        bannedError: false
      })
    } else {
      this.setState({loading: true})

      const self = this

      let res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({
          useremail: useremail,
          password: password,
        })
      })

      let response = await res.json()
      if (response.credentialError) {
        self.setState({
          loading: false,
          loginCredentialError: true,
          loginSubmitError: false,
          bannedError: false
        })
      } else if (response.bannedError) {
        self.setState({
          loading: false,
          loginCredentialError: false,
          loginSubmitError: false,
          bannedError: true
        })
      } else if (response.submitError || !response.success) {
        self.setState({
          loading: false,
          loginCredentialError: false,
          loginSubmitError: true,
          bannedError: false
        })
      } else {
        Router.push(`/${self.props.goto}`)
        // window.location.href = `/${self.props.goto}`
      }
    }
  }

  submitCreateAccount = async () => {
    if (this.state.loading) return
    const username = this.state.createAccountUsernameInputValue
    const useremail = this.state.createAccountUseremailInputValue
    const password = this.state.createAcountPasswordInputValue

    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

    if (username.length < 2 || username.length > 15) {
      this.setState({
        UsernameExistsError: false,
        UsernameLengthError: true,
        EmailExistsError: false,
        PasswordLengthError: false,
        createAccountSubmitError: false
      })
    }
    else if (!pattern.test(useremail)) {
      this.setState({
        EmailExistsError: false,
        UsernameLengthError: false,
        EmailInvalidError: true,
        PasswordLengthError: false,
        createAccountSubmitError: false
      })
    } else if (password.length < 8) {
      this.setState({
        EmailExistsError: false,
        UsernameLengthError: false,
        EmailInvalidError: false,
        PasswordLengthError: true,
        createAccountSubmitError: false
      })
    } else {
      this.setState({loading: true})
      const self = this
      let res = await fetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          username: username,
          useremail: useremail,
          password: password,
        })
      })
      let response = await res.json()

      if (response.usernameLengthError) {
        self.setState({
          loading: false,
          EmailExistsError: false,
          EmailInvalidError: true,
          PasswordLengthError: false,
          createAccountSubmitError: false
        })
      } else if (response.useremailLengthError) {
        self.setState({
          loading: false,
          EmailExistsError: false,
          EmailInvalidError: true,
          PasswordLengthError: false,
          createAccountSubmitError: false
        })
      } else if (response.passwordLengthError) {
        self.setState({
          loading: false,
          EmailExistsError: false,
          EmailInvalidError: false,
          PasswordLengthError: true,
          createAccountSubmitError: false
        })
      } else if (response.alreadyExistsError) {
        self.setState({
          loading: false,
          EmailExistsError: true,
          EmailInvalidError: false,
          PasswordLengthError: false,
          createAccountSubmitError: false
        })
      } else if (response.submitError || !response.success) {
        self.setState({
          loading: false,
          EmailExistsError: false,
          EmailInvalidError: false,
          PasswordLengthError: false,
          createAccountSubmitError: true
        })
      } else {
        // window.location.href = `/${self.props.goto}`
        Router.push(`/${self.props.goto}`)
      }
    }
  }

  render() {
    return (
      <div className={styles.login_wrapper}>
        <HeadMetadata
          title="Login | Coder News"
        />
        <GoogleAnalytics />
        {
          this.state.loginCredentialError ?
          <div className={styles.login_error_msg}>
            <span>Bad login.</span>
          </div> : null
        }
        {
          this.state.loginSubmitError ?
          <div className={styles.login_error_msg}>
            <span>An error occurred.</span>
          </div> : null
        }
        {
          this.state.bannedError ?
          <div className={styles.login_error_msg}>
            <span>User is banned.</span>
          </div> : null
        }
        <div className={styles.login_header}>
          <span>Login</span>
        </div>
        <div className={styles.login_input_item}>
          <div className={styles.login_input_item_label}>
            <span>useremail:</span>
          </div>
          <div className={styles.login_input_item_input}>
            <input
              type="text"
              value={this.state.loginUseremailInputValue}
              onChange={this.updateLoginUseremailInputValue}
            />
          </div>
        </div>
        <div className={styles.login_input_item}>
          <div className={styles.login_input_item_label}>
            <span>password:</span>
          </div>
          <div className={styles.login_input_item_input}>
            <input
              type="password"
              value={this.state.loginPasswordInputValue}
              onChange={this.updateLoginPasswordInputValue}
            />
          </div>
        </div>
        <div className={styles.login_submit_btn}>
          <input
            type="submit"
            value="login"
            onClick={() => this.submitLogin()}
          />
        </div>
        <div className={styles.login_input_item_forgot_text}>
          <span>
            <Link href="/forgot">
              <a>Forgot your Password?</a>
            </Link>
          </span>
        </div>
        {
          this.state.UsernameExistsError ?
          <div className={styles.login_error_msg}>
            <span>That username is taken.</span>
          </div> : null
        }
        {
          this.state.UsernameLengthError ?
          <div className={styles.login_error_msg}>
            <span>Userename must be between 2 and 15 characters long.</span>
          </div> : null
        }
        {
          this.state.EmailExistsError ?
          <div className={styles.login_error_msg}>
            <span>That useremail is taken.</span>
          </div> : null
        }
        {
          this.state.EmailInvalidError ?
          <div className={styles.login_error_msg}>
            <span>Enter a valid email address.</span>
          </div> : null
        }
        {
          this.state.PasswordLengthError ?
          <div className={styles.login_error_msg}>
            <span>Passwords should be at least 8 characters.</span>
          </div> : null
        }
        {
          this.state.createAccountSubmitError ?
          <div className={styles.login_error_msg}>
            <span>An error occurred.</span>
          </div> : null
        }
        <div className={styles.login_header}>
          <span>Create Account</span>
        </div>
        <div className={styles.login_input_item}>
          <div className={styles.login_input_item_label}>
            <span>username:</span>
          </div>
          <div className={styles.login_input_item_input}>
            <input
              type="text"
              value={this.state.createAccountUsernameInputValue}
              onChange={this.updateCreateAccountUsernameInputValue}
            />
          </div>
        </div>
        <div className={styles.login_input_item}>
          <div className={styles.login_input_item_label}>
            <span>useremail:</span>
          </div>
          <div className={styles.login_input_item_input}>
            <input
              type="text"
              value={this.state.createAccountUseremailInputValue}
              onChange={this.updateCreateAccountUseremailInputValue}
            />
          </div>
        </div>
        <div className={styles.login_input_item}>
          <div className={styles.login_input_item_label}>
            <span>password:</span>
          </div>
          <div className={styles.login_input_item_input}>
            <input
              type="password"
              value={this.state.createAcountPasswordInputValue}
              onChange={this.updateCreateAccountPasswordInputValue}
            />
          </div>
        </div>
        <div className={styles.login_submit_btn}>
          <input
            type="submit"
            value="create account"
            onClick={() => this.submitCreateAccount()}
          />
        </div>
      </div>
    )
  }
}
