import { Component } from "react"
import Router from "next/router"
import authUser from "../api/users/authUser.js"
import renderCreatedTime from "../utils/renderCreatedTime.js"
import getEditItemPageData from "../api/items/getEditItemPageData.js"
import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import GoogleAnalytics from "../components/googleAnalytics.js"

import styles from "../styles/pages/edit-item.module.css"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)

  // Get the Item data with ID
  const id = context.query.id

  const result = await getEditItemPageData(id, authResult.username)

  return {
    props: {
      item: typeof result.item === 'undefined' ? null : result.item,
      authUserData: authResult,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      notAllowedError: typeof result.notAllowedError === 'undefined' ? false : result.notAllowedError,
      notFoundError:  typeof result.notFoundError === 'undefined' ? false : result.notFoundError,
      goToString: `edit-item?id=${id}`
    }
  }
}

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      notAllowedError: this.props.notAllowedError,
      notFoundError: this.props.notFoundError,
      titleInputValue: this.props.item ? this.props.item.title : "",
      textInputValue: this.props.item ? this.props.item.textForEditing: "",
      loading: false,
      titleRequiredError: false,
      titleTooLongError: false,
      textTooLongError: false,
      submitError: false
    }
  }

  updateTitleInputValue = (event) => {
    this.setState({titleInputValue: event.target.value})
  }

  setInitialTextareaHeight = () => {
    if (this.props.item.text) {
      const numOfLines = this.props.item.text.split(/\r\n|\r|\n/).length

      return numOfLines + 4
    } else {
      return 6
    }
  }

  updateTextInputValue = (event) => {
    this.setState({textInputValue: event.target.value})
  }

  submitEditItem = async () => {
    if (this.state.loading) return

    if (!this.state.titleInputValue.trim()) {
      this.setState({
        titleRequiredError: true,
        titleTooLongError: false,
        textTooLongError: false,
        submitError: false
      })
    } else if (this.state.titleInputValue.length > 80) {
      this.setState({
        titleRequiredError: false,
        titleTooLongError: true,
        textTooLongError: false,
        submitError: false
      })
    } else if (this.state.textInputValue.length > 5000) {
      this.setState({
        titleRequiredError: false,
        titleTooLongError: false,
        textTooLongError: true,
        submitError: false
      })
    } else {
      this.setState({loading: true})

      const self = this

      let res = await fetch("/api/items/edit", {
        method: "POST",
        body: JSON.stringify({
          id: this.props.item.id,
          title: this.state.titleInputValue,
          text: this.state.textInputValue,
        })
      })

      let response = await res.json()

      if (response.authError) {
        window.location.href = `/login?goto=${self.props.goToString}`
      } else if (response.notAllowedError) {
        self.setState({
          loading: false,
          notAllowedError: true
        })
      } else if (response.titleTooLongError) {
        self.setState({
          loading: false,
          titleRequiredError: false,
          titleTooLongError: true,
          textTooLongError: false,
          submitError: false
        })
      } else if (response.textTooLongError) {
        self.setState({
          loading: false,
          titleRequiredError: false,
          titleTooLongError: false,
          textTooLongError: true,
          submitError: false
        })
      } else if (response.submitError || !response.success) {
        self.setState({
          loading: false,
          titleRequiredError: false,
          titleTooLongError: false,
          textTooLongError: false,
          submitError: true
        })
      } else {
        Router.push(`/item?id=${self.props.item.id}`)
      }

    }
  }

  render () {
    const item = this.props.item

    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title="Edit Item | Coder News"
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData && this.props.authUserData.userSignedIn}
          username={this.props.authUserData && this.props.authUserData.username}
          karma={this.props.authUserData && this.props.authUserData.karma}
          goto={this.props.goToString}
          label="edit item"
        />
        <div className={styles.edit_item_content_container}>
          {
            !this.props.getDataError && !this.state.notAllowedError && !this.state.notFoundError ?
            <>
              <table className={styles.edit_item_top_section}>
                <tbody>
                  <tr>
                    <td valign="top">
                      <div className={styles.edit_item_star}>
                        <span>*</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.edit_item_title}>
                        <a href={item.url ? item.url : `/item?id=${item.id}`}>{item.title}</a>
                      </span>
                      {
                        item.url ?
                        <span className={styles.edit_item_domain}>
                          (<a href={`/from?site=${item.domain}`}>{item.domain}</a>)
                        </span> : null
                      }
                    </td>
                  </tr>
                  <tr className={styles.edit_item_details_bottom}>
                    <td colSpan="1"></td>
                    <td>
                      <span className={styles.edit_item_score}>{item.points.toLocaleString()} {item.points === 1 ? "point" : "points"}</span>
                      <span> by <a href={`/user?id=${item.by}`}>{item.by}</a> </span>
                      <span className={styles.edit_item_time}>
                        <a href={`/item?id=${item.id}`}>{renderCreatedTime(item.created)}</a>
                      </span>
                      <span> | </span>
                      <span className={styles.edit_item_edit}>
                        <a href="">edit</a>
                      </span>
                      <span> | </span>
                      <span>
                        <a href={`/delete-item?id=${item.id}`}>delete</a>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              {
                !item.url && item.text ?
                <div className={styles.edit_item_text_content}>
                  <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                </div> : null
              }
              <table className={styles.edit_item_form_section}>
                <tbody>
                  <tr>
                    <td className={styles.edit_item_title_input_label}>title:</td>
                    <td className={styles.edit_item_title_input}>
                      <input
                        type="text"
                        value={this.state.titleInputValue}
                        onChange={this.updateTitleInputValue}
                      />
                    </td>
                  </tr>
                  {
                    item.url ?
                    <tr>
                      <td className={styles.edit_item_url_label}>url:</td>
                      <td className={styles.edit_item_url_value}>{item.url}</td>
                    </tr> : null
                  }
                  {
                    item.url == '' ?
                    <tr>
                      <td className={styles.edit_item_text_input_label}>text:</td>
                      <td className={styles.edit_item_text_input}>
                        <textarea
                          type="text"
                          cols={60}
                          rows={this.setInitialTextareaHeight()}
                          value={this.state.textInputValue}
                          onChange={this.updateTextInputValue}
                        />
                      </td>
                    </tr> : null
                  }
                </tbody>
              </table>
              <div className={styles.edit_item_submit_btn}>
                <input
                  type="submit"
                  value="update"
                  onClick={() => this.submitEditItem()}
                />
              </div>
              {
                this.state.submitError ?
                <div className={styles.edit_item_submit_error_msg}>
                  <span>An error occurred.</span>
                </div> : null
              }
              {
                this.state.titleRequiredError ?
                <div className={styles.edit_item_submit_error_msg}>
                  <span>Title is required.</span>
                </div> : null
              }
              {
                this.state.titleTooLongError ?
                <div className={styles.edit_item_submit_error_msg}>
                  <span>Title exceeds limit of 80 characters.</span>
                </div> : null
              }
              {
                this.state.textTooLongError ?
                <div className={styles.edit_item_submit_error_msg}>
                  <span>Text exceeds limit of 5,000 characters.</span>
                </div> : null
              }
            </> :
            <div className={styles.edit_item_error_msg}>
              {
                this.props.getDataError ?
                <span>An error occurred.</span> : null
              }
              {
                this.state.notAllowedError ?
                <span>You can’t edit that item.</span> : null
              }
              {
                this.state.notFoundError ?
                <span>Item not found.</span> : null
              }
            </div>
          }
        </div>
        <Footer />
      </div>
    )
  }
}
