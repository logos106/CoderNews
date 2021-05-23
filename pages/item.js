import { Component } from "react"

import authUser from "../api/users/authUser.js"
import getItemById from "../api/items/getItemById.js"

import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import Item from "../components/item.js"
import CommentSection from "../components/commentSection.js"
import GoogleAnalytics from "../components/googleAnalytics.js"

export async function getServerSideProps (context) {
  const itemId = context.query.id ? context.query.id : ""
  const page = context.query.page ? parseInt(context.query.page) : 1

  const authResult = await authUser()

  const result = await getItemById(itemId, page, authUser)

  return {
    props: {
      item: typeof result.item === 'undefined' ? null : result.item,
      page: page,
      authUserData: authResult,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      goToString: typeof result.goToString === 'undefined' ? false : result.goToString,
      comments: typeof result.comments === 'undefined' ? false : result.comments,
      isMoreComments: typeof result.isMoreComments === 'undefined' ? false : result.isMoreComments,
    }
  }
}

export default class extends Component {
  render () {
    const item = this.props.item

    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title={item ? `${item.title} | Coder News` : "Coder News"}
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData && this.props.authUserData.userSignedIn}
          username={this.props.authUserData && this.props.authUserData.username}
          karma={this.props.authUserData && this.props.authUserData.karma}
          goto={this.props.goToString}
        />
        <div className="item-content-container">
          {
            item && !this.props.notFoundError && !this.props.getDataError ?
            <>
              <Item
                item={item}
                currUsername={this.props.authUserData.username}
                userSignedIn={this.props.authUserData.userSignedIn}
                goToString={this.props.goToString}
                isModerator={this.props.authUserData.isModerator}
              />
              <CommentSection
                comments={this.props.comments}
                parentItemId={item.id}
                isMore={this.props.isMoreComments}
                isMoreLink={`/item?id=${item.id}&page=${this.props.page + 1}`}
                userSignedIn={this.props.authUserData.userSignedIn}
                currUsername={this.props.authUserData.username}
                showDownvote={this.props.authUserData.showDownvote}
                goToString={this.props.goToString}
                isModerator={this.props.authUserData.isModerator}
              />
            </> :
            <div className="item-get-data-error-msg">
              {
                this.props.notFoundError ?
                <span>No such item.</span> :
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
