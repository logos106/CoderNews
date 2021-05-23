import { Component } from "react"
import HeadMetadata from "../components/headMetadata.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import createNewUser from "../api/users/createNewUser.js"
import loginUser from "../api/users/loginUser.js"
import authUser from "../api/users/authUser.js"
import removeUserCookieData from "../api/users/removeUserCookieData.js"
import Router from "next/router"

import styles from '../styles/pages/login.module.css';

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
      createAccountUseremailInputValue: "",
      createAcountPasswordInputValue: "",
      createAccountUseremailExistsError: false,
      createAccountUseremailLengthError: false,
      createAccountPasswordLengthError: false,
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
      console.log("Login Result: ", response)
      if (!response) {
        self.setState({
          loading: false,
          loginCredentialError: true,
          loginSubmitError: false,
          bannedError: false
        })
      } else {
        Router.push('/')
      }
      /* 
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
        // window.location.href = `/${self.props.goto}`
        Router.push('/')
      } */
      
    }
  }

  submitCreateAccount = () => {
    if (this.state.loading) return

    const useremail = this.state.createAccountUseremailInputValue
    const password = this.state.createAcountPasswordInputValue

    if (useremail.length < 2 || useremail.length > 15) {
      this.setState({
        createAccountUseremailExistsError: false,
        createAccountUseremailLengthError: true,
        createAccountPasswordLengthError: false,
        createAccountSubmitError: false
      })
    } else if (password.length < 8) {
      this.setState({
        createAccountUseremailExistsError: false,
        createAccountUseremailLengthError: false,
        createAccountPasswordLengthError: true,
        createAccountSubmitError: false
      })
    } else {
      this.setState({loading: true})

      const self = this

      createNewUser(useremail, password, function(response) {
        if (response.useremailLengthError) {
          self.setState({
            loading: false,
            createAccountUseremailExistsError: false,
            createAccountUseremailLengthError: true,
            createAccountPasswordLengthError: false,
            createAccountSubmitError: false
          })
        } else if (response.passwordLengthError) {
          self.setState({
            loading: false,
            createAccountUseremailExistsError: false,
            createAccountUseremailLengthError: false,
            createAccountPasswordLengthError: true,
            createAccountSubmitError: false
          })
        } else if (response.alreadyExistsError) {
          self.setState({
            loading: false,
            createAccountUseremailExistsError: true,
            createAccountUseremailLengthError: false,
            createAccountPasswordLengthError: false,
            createAccountSubmitError: false
          })
        } else if (response.submitError || !response.success) {
          self.setState({
            loading: false,
            createAccountUseremailExistsError: false,
            createAccountUseremailLengthError: false,
            createAccountPasswordLengthError: false,
            createAccountSubmitError: true
          })
        } else {
          // window.location.href = `/${self.props.goto}`
          Router.push('/')
        }
      })
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
            <a href="/forgot">Forgot your Password?</a>
          </span>
        </div>
        {
          this.state.createAccountUseremailExistsError ?
          <div className={styles.login_error_msg}>
            <span>That useremail is taken.</span>
          </div> : null
        }
        {
          this.state.createAccountUseremailLengthError ?
          <div className={styles.login_error_msg}>
            <span>Useremail must be between 2 and 15 characters long.</span>
          </div> : null
        }
        {
          this.state.createAccountPasswordLengthError ?
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
