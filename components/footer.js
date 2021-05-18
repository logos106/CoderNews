import { Component } from "react"
import styles from "../styles/components/footer.module.css"

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchInputValue: ""
    }
  }

  updateSearchInputValue = (event) => {
    this.setState({searchInputValue: event.target.value})
  }

  listenForEnterKeyPress = (event) => {
    if (event.keyCode === 13 && this.state.searchInputValue) {
      window.location.href = `/search?q=${this.state.searchInputValue}`
    }
  }

  render() {
    return (
      <div className={styles.footer_wrapper}>
        <div className={styles.footer_link_list}>
          <div className={styles.footer_link_list_item}>
            <a href="/newsguidelines">
              <span>Guidelines</span>
            </a>
          </div>
          <div className={styles.footer_link_list_item}>
            <span>|</span>
          </div>
          <div className={styles.footer_link_list_item}>
            <a href="/newsfaq">
              <span>FAQ</span>
            </a>
          </div>
          <div className={styles.footer_link_list_item}>
            <span>|</span>
          </div>
          <div className={styles.footer_link_list_item}>
            <a href="mailto:support@codernews.com">
              <span>Contact</span>
            </a>
          </div>
        </div>
        <div className={styles.footer_search}>
          <span className={styles.footer_search_label}>Search:</span>
          <input
            className={styles.footer_search_input}
            type="text"
            value={this.state.searchInputValue}
            onChange={this.updateSearchInputValue}
            onKeyDown={this.listenForEnterKeyPress}
          />
        </div>
      </div>
    )
  }
}
