import { Component } from "react"
import authUser from "../api/users/authUser.js"
import Header from "../components/header.js"
import Footer from "../components/footer.js"
import HeadMetadata from "../components/headMetadata.js"
import ItemsList from "../components/itemsList.js"
import CommentsList from "../components/commentsList.js"
import GoogleAnalytics from "../components/googleAnalytics.js"
import getUserFavoritedItemsByPage from "../api/items/getUserFavoritedItemsByPage.js"
import getUserFavoritedCommentsByPage from "../api/comments/getUserFavoritedCommentsByPage.js"

import styles from "../styles/pages/favorites.module.css"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)

  const uid = context.query.id ? context.query.id : ""
  const page = context.query.page ? parseInt(context.query.page) : 1
  const showItems = context.query.comments === "t" ? false : true

  let itemsApiResult = {}
  let commentsApiResult = {}

  if (showItems)
    itemResult = await getUserFavoritedItemsByPage(uid, page, authUser)
  else
    commentResult = await getUserFavoritedCommentsByPage(uid, page, authUser)

  const goToString = page > 1 ?
    `favorites?id=${userId}${showItems ? "" : "&comments=t"}&page=${page}` :
    `favorites?id=${userId}${showItems ? "" : "&comments=t"}`

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
                      typeof commentResult.notFoundError !== 'undefined' && commentResult.notFoundError,
      goToString: goToString
    }
  }
}

export default class extends Component {
  render () {
    return (
      <div className="layout-wrapper">
        <HeadMetadata
          title={!this.props.notFoundError ? `${this.props.userId}'s favorites | Coder News` : "Coder News"}
        />
        <GoogleAnalytics />
        <Header
          userSignedIn={this.props.authUserData && this.props.authUserData.userSignedIn}
          username={this.props.authUserData && this.props.authUserData.username}
          karma={this.props.authUserData && this.props.authUserData.karma}
          goto={this.props.goToString}
          label="favorites"
        />
        <div className="items-list-content-container">
          {
            !this.props.getDataError && !this.props.notFoundError ?
            <>
              <div className={this.props.showItems ? "favorites-top-links items" : "favorites-top-links comments"}>
                <span className={this.props.showItems ? "active" : null}>
                  <a href={`/favorites?id=${this.props.userId}`}>submissions</a>
                </span>
                <span> | </span>
                <span className={this.props.showComments ? "active" : null}>
                  <a href={`/favorites?id=${this.props.userId}&comments=t`}>comments</a>
                </span>
              </div>
              <>
                {
                  this.props.showItems ?
                  <>
                    {
                      this.props.items.length ?
                      <ItemsList
                        items={this.props.items}
                        goToString={this.props.goToString}
                        userSignedIn={this.props.authUserData.userSignedIn}
                        currUsername={this.props.authUserData.username}
                        showUnfavoriteOption={this.props.userId === this.props.authUserData.username}
                        showRank={true}
                        isMoreLink={`/favorites?id=${this.props.userId}&page=${this.props.page + 1}`}
                        isMore={this.props.isMoreItems}
                        isModerator={this.props.authUserData.isModerator}
                      /> :
                      <div className="favorites-none-found-msg items">
                        <p>{this.props.userId} hasn’t added any favorite submissions yet.</p>
                        <p>To add an item to your own favorites, click on its timestamp to go to its page, then click 'favorite' at the top.</p>
                      </div>
                    }
                  </> : null
                }
                {
                  this.props.showComments ?
                  <>
                    {
                      this.props.comments.length ?
                      <CommentsList
                        comments={this.props.comments}
                        goToString={this.props.goToString}
                        userSignedIn={this.props.authUserData.userSignedIn}
                        currUsername={this.props.authUserData.username}
                        showUnfavoriteOption={this.props.userId === this.props.authUserData.username}
                        showDownvote={this.props.authUserData.showDownvote}
                        isMoreLink={`/favorites?id=${this.props.userId}&page=${this.props.page + 1}&comments=t`}
                        isMore={this.props.isMoreComments}
                        isModerator={this.props.authUserData.isModerator}
                      /> :
                      <div className="favorites-none-found-msg comments">
                        <p>{this.props.userId} hasn’t added any favorite comments yet.</p>
                        <p>To add a comment to your own favorites, click on its timestamp to go to its page, then click 'favorite' at the top.</p>
                      </div>
                    }
                  </> : null
                }
              </>
            </> :
            <div className="items-list-error-msg">
              {
                this.props.notFoundError ?
                <span>No such user.</span> :
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
