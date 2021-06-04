import { Component } from "react"
import Router from "next/router"
import authUser from "../api/users/authUser.js"
import HeadMetadata from "../components/headMetadata.js"
import AlternateHeader from "../components/alternateHeader.js"
import GoogleAnalytics from "../components/googleAnalytics.js"

import styles from "../styles/pages/submit.module.css"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)

  if (!authResult.userSignedIn) {
    context.res.writeHead(302, {
      Location: "/login?goto=submit"
    })

    context.res.end()
  }

  const data = null
  return { props: { data } }
}

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      titleInputValue: "",
      urlInputValue: "",
      textInputValue: "",
      titleRequiredError: false,
      titleTooLongError: false,
      invalidUrlError: false,
      urlAndTextError: false,
      urlFormatError: false,
      textTooLongError: false,
      submitError: false,
      loading: false
    }
  }

  updateTitleInputValue = (event) => {
    this.setState({titleInputValue: event.target.value})
  }

  updateUrlInputValue = (event) => {
    this.setState({urlInputValue: event.target.value})
  }

  updateTextInputValue = (event) => {
    this.setState({textInputValue: event.target.value})
  }

  submitRequest = async () => {
    if (this.state.loading) return

    if (!this.state.titleInputValue.trim()) {
      this.setState({
        titleRequiredError: true,
        titleTooLongError: false,
        invalidUrlError: false,
        urlAndTextError: false,
        textTooLongError: false,
        submitError: false
      })
    } else if (this.state.titleInputValue.length > 80) {
      this.setState({
        titleRequiredError: false,
        titleTooLongError: true,
        invalidUrlError: false,
        urlAndTextError: false,
        textTooLongError: false,
        submitError: false
      })
    } else if (this.state.urlInputValue && this.state.textInputValue) {
      this.setState({
        titleRequiredError: false,
        titleTooLongError: false,
        invalidUrlError: false,
        urlAndTextError: true,
        textTooLongError: false,
        submitError: false
      })
    } else if (this.state.textInputValue.length > 5000) {
      this.setState({
        titleRequiredError: false,
        titleTooLongError: false,
        invalidUrlError: false,
        urlAndTextError: false,
        textTooLongError: true,
        submitError: false
      })
    } else {
      this.setState({loading: true})

      const self = this

      let res = await fetch("/api/items/submitNewItem", {
        method: "POST",
        body: JSON.stringify({
          title: this.state.titleInputValue,
          url: this.state.urlInputValue,
          text: this.state.textInputValue,
        })
      })
      let response = await res.json()

      if (response.authError) {
        window.location.href = "/login?goto=submit"
      } else if (response.titleRequiredError) {
        self.setState({
          loading: false,
          titleRequiredError: true,
          titleTooLongError: false,
          invalidUrlError: false,
          urlAndTextError: false,
          textTooLongError: false,
          submitError: false,
          urlFormatError: false
        })
      } else if (response.urlAndTextError) {
        self.setState({
          loading: false,
          titleRequiredError: false,
          titleTooLongError: false,
          invalidUrlError: false,
          urlAndTextError: true,
          textTooLongError: false,
          submitError: false,
          urlFormatError: false
        })
      } else if (response.invalidUrlError) {
        self.setState({
          loading: false,
          titleRequiredError: false,
          titleTooLongError: false,
          invalidUrlError: true,
          urlAndTextError: false,
          textTooLongError: false,
          submitError: false,
          urlFormatError: false
        })
      } else if (response.titleTooLongError) {
        self.setState({
          loading: false,
          titleRequiredError: false,
          titleTooLongError: true,
          invalidUrlError: false,
          urlAndTextError: false,
          textTooLongError: false,
          submitError: false,
          urlFormatError: false
        })
      } else if (response.textTooLongError) {
        self.setState({
          loading: false,
          titleRequiredError: false,
          titleTooLongError: false,
          invalidUrlError: false,
          urlAndTextError: false,
          textTooLongError: true,
          submitError: false,
          urlFormatError: false
        })
      } else if (response.urlFormatError) {
        self.setState({
          loading: false,
          titleRequiredError: false,
          titleTooLongError: false,
          invalidUrlError: false,
          urlAndTextError: false,
          textTooLongError: false,
          submitError: false,
          urlFormatError: true
        })
      } else if (response.submitError || !response.success) {
        self.setState({
          loading: false,
          titleRequiredError: false,
          titleTooLongError: false,
          invalidUrlError: false,
          urlAndTextError: false,
          textTooLongError: false,
          submitError: true,
          urlFormatError: false
        })
      } else {
        Router.push('/newest')
      }
    }
  }

  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title="Submit | Coder News"
        />
        <GoogleAnalytics />
        <AlternateHeader
          displayMessage="Submit"
        />
        <div className={styles.submit_content_container}>
          {
            this.state.titleRequiredError ?
            <div className={styles.submit_content_error_msg}>
              <span>Title is required.</span>
            </div> : null
          }
          {
            this.state.titleTooLongError ?
            <div className={styles.submit_content_error_msg}>
              <span>Title exceeds limit of 80 characters.</span>
            </div> : null
          }
          {
            this.state.invalidUrlError ?
            <div className={styles.submit_content_error_msg}>
              <span>URL is invalid.</span>
            </div> : null
          }
          {
            this.state.urlAndTextError ?
            <div className={styles.submit_content_error_msg}>
              <span>Submissions can’t have both urls and text, so you need to pick one. If you keep the url, you can always post your text as a comment in the thread.</span>
            </div> : null
          }
          {
            this.state.textTooLongError ?
            <div className={styles.submit_content_error_msg}>
              <span>Text exceeds limit of 5,000 characters.</span>
            </div> : null
          }
          {
            this.state.submitError ?
            <div className={styles.submit_content_error_msg}>
              <span>An error occurred.</span>
            </div> : null
          }
          {
            this.state.urlFormatError ?
            <div className={styles.submit_content_error_msg}>
              <span>URL format is invalid.</span>
            </div> : null
          }
          <div className={styles.submit_content_input_item, styles.title}>
            <div className={styles.submit_content_input_item_label}>
              <span>title</span>
            </div>
            <div className={styles.submit_content_input_item_input}>
              <input
                type="text"
                value={this.state.titleInputValue}
                onChange={this.updateTitleInputValue}
              />
            </div>
          </div>
          <div className={[styles.submit_content_input_item, styles.url].join(" ")}>
            <div className={styles.submit_content_input_item_label}>
              <span>url</span>
            </div>
            <div className={styles.submit_content_input_item_input}>
              <input
                type="text"
                value={this.state.urlInputValue}
                onChange={this.updateUrlInputValue}
              />
            </div>
          </div>
          <div className={styles.submit_content_input_or_divider}>
            <span>or</span>
          </div>
          <div className={styles.submit_content_text_input_item}>
            <div className={styles.submit_content_text_input_item_label}>
              <span>text</span>
            </div>
            <div className={styles.submit_content_text_input_item_input}>
              <textarea
                type="text"
                value={this.state.textInputValue}
                onChange={this.updateTextInputValue}
              />
            </div>
          </div>
          <div className={styles.submit_content_input_btn}>
            <input
              type="submit"
              value="submit"
              onClick={() => this.submitRequest(this.props.authUser)}
            />
          </div>
          <div className={styles.submit_content_bottom_instructions}>
            <span>Leave url blank to submit a question for discussion. If there is no url, the text (if any) will appear at the top of the thread.</span>
          </div>
        </div>
      </div>
    )
  }
}
