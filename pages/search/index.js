import { Component } from "react"
import authUser from "../../api/users/authUser.js"
import HeadMetadata from "../../components/headMetadata.js"
import SearchPageHeader from "../../components/search/header.js"
import SearchPageFooter from "../../components/search/footer.js"
import Item from "../../components/search/item.js"
import Comment from "../../components/search/comment.js"
import Filters from "../../components/search/filters.js"
import NoResults from "../../components/search/noResults.js"
import PageNumbers from "../../components/search/pageNumbers.js"
import GoogleAnalytics from "../../components/googleAnalytics.js"
import getAlgoliaData from "../../api/search/getAlgoliaData.js"

import styles from "../../styles/pages/search/index.module.css"

export async function getServerSideProps(context) {
  const authResult = await authUser(context.req, context.res)
  const result = await getAlgoliaData(context.req.query, context.req.headers.cookie)

  return {
    props: {
      searchQuery: context.query.q ? context.query.q : "",
      processingTimeMS: result.processingTimeMS,
      hits: typeof result.hits === 'undefined' ? [] : result.hits,
      itemType: typeof result.itemType === 'undefined' ? "" : result.itemType,
      sortBy: typeof result.sortBy === 'undefined' ? "" : result.sortBy,
      dateRange: typeof result.dateRange === 'undefined' ? "" : result.dateRange,
      startDate: typeof result.startDate === 'undefined' ? "" : result.startDate,
      endDate: typeof result.endDate === 'undefined' ? "" : result.endDate,
      currPageNumber: result.page,
      totalNumOfHits: result.nbHits,
      totalNumOfPages: result.nbPages,
      getDataError: typeof result.getDataError === 'undefined' ? false : result.getDataError,
      goToString: ""
    }
  }
}

export default class extends Component {
  render () {
    return (
      <div className="search-wrapper">
        <HeadMetadata
          title="Search | Coder News"
        />
        <GoogleAnalytics />
        <SearchPageHeader
          searchQuery={this.props.searchQuery}
          showSearchBar={true}
          showSettingsButton={true}
          currPageNumber={this.props.currPageNumber}
          itemType={this.props.itemType}
          dateRange={this.props.dateRange}
          startDate={this.props.startDate}
          endDate={this.props.endDate}
          sortBy={this.props.sortBy}
        />
        <div className="search-results">
          <Filters
            searchQuery={this.props.searchQuery}
            currPageNumber={this.props.currPageNumber}
            dateRange={this.props.dateRange}
            startDate={this.props.startDate}
            endDate={this.props.endDate}
            sortBy={this.props.sortBy}
            itemType={this.props.itemType}
            totalNumOfHits={this.props.totalNumOfHits}
            processingTimeMS={this.props.processingTimeMS}
          />
          <div className="search-results-items">
            {
              this.props.hits.length > 0 && !this.props.getDataError ?
              this.props.hits.map((hit, index) => {
                return (
                  hit.type === "item" ?
                  <Item
                    item={hit}
                    key={hit.objectID}
                    searchQuery={this.props.searchQuery}
                  /> :
                  <Comment
                    comment={hit}
                    key={hit.objectID}
                    searchQuery={this.props.searchQuery}
                  />
                )
              }) : null
            }
            {
              this.props.getDataError ?
              <div className="search-error-msg">
                <span>An error occurred.</span>
              </div> : null
            }
            {
              this.props.hits.length === 0 && !this.props.getDataError ?
              <NoResults
                itemType={this.props.itemType}
                searchQuery={this.props.searchQuery}
                dateRange={this.props.dateRange}
                currPageNumber={this.props.currPageNumber}
                sortBy={this.props.sortBy}
                startDate={this.props.startDate}
                endDate={this.props.endDate}
              /> : null
            }
          </div>
          {
            !this.props.getDataError ?
            <PageNumbers
              totalNumOfPages={this.props.totalNumOfPages}
              currPageNumber={this.props.currPageNumber}
              searchQuery={this.props.searchQuery}
              itemType={this.props.itemType}
              dateRange={this.props.dateRange}
              startDate={this.props.startDate}
              endDate={this.props.endDate}
              sortBy={this.props.sortBy}
            /> : null
          }
        </div>
        <SearchPageFooter />
      </div>
    )
  }
}
