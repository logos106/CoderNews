import { Component } from "react"
import authUser from "../api/users/authUser.js"
import moment from "moment"
import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import ItemsList from "../components/itemsList.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import getRankedItemsByDay from "../api/items/getRankedItemsByDay.js"

import "../styles/pages/past.module.css"

export async function getServerSideProps(context) {
  const day = context.query.day ? context.query.day : moment().subtract(1, "day").format("YYYY-MM-DD")
  const page = context.query.page ? parseInt(context.query.page) : 1

  const authResult = await authUser(context.req, context.res)

  const result = await getRankedItemsByDay(day, page, authResult)

  return {
    props: {
      items: typeof result.items === 'undefined' ? null : result.items,
      authUserData: authResult,
      day: day,
      page: page,
      isMore: typeof result.isMore === 'undefined' ? false : result.isMore,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      invalidDateError: typeof result.invalidDateError === 'undefined' ? false : result.invalidDateError,
      goToString: page > 1 ? `past?day=${day}&page=${page}` : `past?day=${day}`
    }
  }
}

export default class extends Component {
  renderGoBackwardLinks = () => {
    const day = this.props.day

    const backOneDay = moment(day).subtract(1, "day").format("YYYY-MM-DD")
    const backOneMonth = moment(day).subtract(1, "month").format("YYYY-MM-DD")
    const backOneYear = moment(day).subtract(1, "year").format("YYYY-MM-DD")

    return (
      <>
        <span>Go back a </span>
        <span><a href={`/past?day=${backOneDay}`}>day</a>, </span>
        <span><a href={`/past?day=${backOneMonth}`}>month</a>, </span>
        <span>or <a href={`/past?day=${backOneYear}`}>year</a>. </span>
      </>
    )
  }

  renderGoForwardLinks = () => {
    const day = this.props.day

    const differenceInDays = moment().startOf("day").diff(moment(day), "days")

    const forwardOneDay = moment(day).add(1, "day").format("YYYY-MM-DD")
    const forwardOneMonth = moment(day).add(1, "month").format("YYYY-MM-DD")
    const forwardOneYear = moment(day).add(1, "year").format("YYYY-MM-DD")

    if (differenceInDays >= 365) {
      return (
        <span>Go forward a <a href={`/past?day=${forwardOneDay}`}>day</a>, <a href={`/past?day=${forwardOneMonth}`}>month</a> or <a href={`/past?day=${forwardOneYear}`}>year</a>.</span>
      )
    } else if (differenceInDays >= 30) {
      return (
        <span>Go forward a <a href={`/past?day=${forwardOneDay}`}>day</a> or <a href={`/past?day=${forwardOneMonth}`}>month</a>.</span>
      )
    } else if (differenceInDays > 0) {
      return (
        <span>Go forward a <a href={`/past?day=${forwardOneDay}`}>day</a>.</span>
      )
    } else {
      return null
    }
  }

  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title={!this.props.invalidDateError ? `${this.props.day} Top Items | Coder News`: "Coder News"}
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData && this.props.authUserData.userSignedIn}
          username={this.props.authUserData && this.props.authUserData.username}
          karma={this.props.authUserData && this.props.authUserData.karma}
          goto={this.props.goToString}
          pageName="past"
          label={!this.props.invalidDateError && !this.props.getDataError ? this.props.day : null}
        />
        <div className="items-list-content-container">
          {
            !this.props.getDataError && !this.props.invalidDateError ?
            <>
              <div className="past-items-top-header">
                <span>Stories from {moment(this.props.day).format("MMMM D, YYYY")}, ordered by highest point scores.</span>
              </div>
              <div className="past-items-bottom-header">
                {this.renderGoBackwardLinks()}
                {this.renderGoForwardLinks()}
              </div>
              <ItemsList
                items={this.props.items}
                goToString={this.props.goToString}
                userSignedIn={this.props.authUserData.userSignedIn}
                currUsername={this.props.authUserData.username}
                showHideOption={true}
                showRank={true}
                isMoreLink={`past?day=${this.props.day}&page=${this.props.page + 1}`}
                isMore={this.props.isMore}
                isModerator={this.props.authUserData.isModerator}
              />
            </> :
            <div className="items-list-error-msg">
              {
                this.props.invalidDateError ?
                <span>Invalid day.</span> :
                <span>An error occured.</span>
              }
            </div>
          }
        </div>
        <Footer />
      </div>
    )
  }
}
