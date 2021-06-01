import { Component } from "react"
import authUser from "../api/users/authUser.js"
import renderCreatedTime from "../utils/renderCreatedTime.js"
import AlternateHeader from "../components/alternateHeader.js"
import HeadMetadata from "../components/headMetadata.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import getDeleteItemPageData from "../api/items/getDeleteItemPageData.js"

import "../styles/pages/delete-item.module.css"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)
  const result = await getDeleteItemPageData(context.query.id, authResult)

  return {
    props: {
      item: typeof result.item === 'undefined' ? null : result.item,
      authUserData: authResult,
      getDataError: typeof result.getDataError === 'undefined' ? false: true,
      notAllowedError: typeof result.notAllowedError === 'undefined' ? false: true,
      notFoundError: typeof result.notFoundError === 'undefined' ? false: true,
      goToString: context.query.goto ? decodeURIComponent(context.query.goto) : ""
    }
  }
}

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      notAllowedError: this.props.notAllowedError,
      notFoundError: this.props.notFoundError,
      loading: false,
      submitError: false
    }
  }

  submitDeleteItem = async () => {
    if (this.state.loading) return

    this.setState({loading: true})

    const self = this
    let res = await fetch("/api/items/deleteItem", {
      method: "POST",
      body: JSON.stringify({
        itemId: this.props.item.id
      })
    })
    let response = await res.json()
    if (response.notAllowedError) {
      self.setState({
        loading: false,
        notAllowedError: true,
        notFoundError: false,
        submitError: false
      })
    } else if (response.notFoundError) {
      self.setState({
        loading: false,
        notAllowedError: false,
        notFoundError: true,
        submitError: false
      })
    } else if (response.submitError || !response.success) {
      self.setState({
        loading: false,
        notAllowedError: false,
        notFoundError: false,
        submitError: true
      })
    } else {
      window.location.href = `/${self.props.goToString}`
    }
  }

  goBackToOriginPage = () => {
    if (this.state.loading) return

    window.location.href = `/${this.props.goToString}`
  }

  render () {
    const item = this.props.item

    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title="Delete Item | Coder News"
        />
        <GoogleAnalytics />
        <AlternateHeader
          displayMessage="Delete Item"
        />
        <div className="delete-item-content-container">
          {
            !this.props.getDataError && !this.state.notAllowedError && !this.state.notFoundError ?
            <>
              <div className="delete-item-top-section">
                <table>
                  <tbody>
                    <tr>
                      <td valign="top">
                        <div className="delete-item-star">
                          <span>*</span>
                        </div>
                      </td>
                      <td>
                        <span className="delete-item-title">
                          <a href={item.url}>{item.title}</a>
                        </span>
                        {
                          item.url ?
                          <span className="delete-item-domain">
                            (<a href={`/from?site=${item.domain}`}>{item.domain}</a>)
                          </span> : null
                        }
                      </td>
                    </tr>
                    <tr className="delete-item-details-bottom">
                      <td colSpan="1"></td>
                      <td>
                        <span className="delete-item-score">{item.points.toLocaleString()} {item.points === 1 ? "point" : "points"}</span>
                        <span> by <a href={`/user?id=${item.by}`}>{item.by}</a> </span>
                        <span className="delete-item-time">
                          <a href={`/item?id=${item.id}`}>{renderCreatedTime(item.created)}</a>
                        </span>
                        <span> | </span>
                        <span className="delete-item-edit"><a href={`/edit-item?id=${item.id}`}>edit</a></span>
                        <span> | </span>
                        <span><a href="">delete</a></span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {
                  !item.url && item.text ?
                  <div className="delete-item-text-content">
                    <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                  </div> : null
                }
              </div>
              <div className="delete-item-confirm-msg">
                <span>Do you want to delete this item?</span>
              </div>
              <div className="delete-item-btns">
                <input
                  type="submit"
                  value="Yes"
                  className="delete-item-yes-btn"
                  onClick={ this.submitDeleteItem }
                />
                <input
                  type="submit"
                  value="No"
                  onClick={ this.goBackToOriginPage }
                />
              </div>
              {
                this.state.submitError ?
                <div className="delete-item-submit-error-msg">
                  <span>An error occurred.</span>
                </div> : null
              }
            </> :
            <div className="delete-item-error-msg">
              {
                this.props.getDataError ?
                <span>An error occurred.</span> : null
              }
              {
                this.state.notAllowedError ?
                <span>You are not allowed to delete that item.</span> : null
              }
              {
                this.state.notFoundError ?
                <span>Item not found.</span> : null
              } 
            </div>
          }
        </div>
      </div>
    )
  }
}
