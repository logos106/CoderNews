import { Component } from "react"
import authUser from "../api/users/authUser.js"
import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import ItemsList from "../components/itemsList.js"
import CommentsList from "../components/commentsList.js"
import GoogleAnalytics from "../components/googleAnalytics.js"

import getUserUpvotedItemsByPage from "../api/items/getUserUpvotedItemsByPage.js"
import getUserUpvotedCommentsByPage from "../api/comments/getUserUpvotedCommentsByPage.js"

export async function getServerSideProps(context) {
  const authResult = await authUser()

  const uid = context.query.id ? context.query.id : ""
  const page = context.query.page ? parseInt(context.query.page) : 1
  const showItems = context.query.comments === "t" ? false : true

  let itemsApiResult = {}
  let commentsApiResult = {}

  if (showItems)
    itemResult = await getUserUpvotedItemsByPage(uid, page, authUser)
  else
    commentResult = await getUserUpvotedCommentsByPage(uid, page, authUser)

  const goToString = page > 1 ?
    `upvoted?id=${userId}${showItems ? "" : "&comments=t"}&page=${page}` :
    `upvoted?id=${userId}${showItems ? "" : "&comments=t"}`

  return {
    props: {
      authUserData: authResult,
      items: typeof itemResult.items === 'undefined' ? null : itemResult.items,
      showItems: showItems,
      isMoreItems: typeof itemResult.isMore === 'undefined' ? false : itemResult.isMore,
      comments: typeof commentResult.items === 'undefined' ? null : commentResult.items,
      showComments: !showItems,
      isMoreComments: typeof commentResult.isMore === 'undefined' ? false : commentResult.isMore,
      page: page,
      notFoundError: typeof itemResult.notFoundError !== 'undefined' && itemResult.notFoundError ||
                      typeof commentResult.notFoundError !== 'undefined' && commentResult.notFoundError,
      getDataError: typeof itemResult.getDataError !== 'undefined' && itemResult.getDataError ||
                      typeof commentResult.notFoundError !== 'undefined' && commentResult.notFoundError
      goToString: goToString
    }
  }
}

export default class extends Component {
  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title={`Upvoted ${this.props.showItems ? "Items" : "Comments"} | Coder News`}
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData && this.props.authUserData.userSignedIn}
          username={this.props.authUserData && this.props.authUserData.username}
          karma={this.props.authUserData && this.props.authUserData.karma}
          goto={this.props.goToString}
          label="upvoted"
        />
        <div className="items-list-content-container">
          {
            !this.props.getDataError && !this.props.notAllowedError ?
            <>
              {
                this.props.showItems ?
                <ItemsList
                  items={this.props.items}
                  goToString={this.props.goToString}
                  userSignedIn={this.props.authUserData.userSignedIn}
                  currUsername={this.props.authUserData.username}
                  showRank={true}
                  isMoreLink={`/upvoted?id=${this.props.userId}&page=${this.props.page + 1}`}
                  isMore={this.props.isMoreItems}
                  isModerator={this.props.authUserData.isModerator}
                /> : null
              }
              {
                this.props.showComments ?
                <CommentsList
                  comments={this.props.comments}
                  userSignedIn={this.props.authUserData.userSignedIn}
                  currUsername={this.props.authUserData.username}
                  showDownvote={this.props.authUserData.showDownvote}
                  isMoreLink={`/upvoted?id=${this.props.userId}&page=${this.props.page + 1}&comments=t`}
                  isMore={this.props.isMoreComments}
                  isModerator={this.props.authUserData.isModerator}
                /> : null
              }
            </> :
            <div className="items-list-error-msg">
              {
                this.props.notAllowedError ?
                <span>Can’t display that.</span> :
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
