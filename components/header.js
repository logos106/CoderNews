import { Component } from "react"
import Link from 'next/link'
import logoutUser from "../api/users/logoutUser.js"
import styles from "../styles/components/header.module.css"

export default class extends Component {
  requestLogout = () => {
    logoutUser(function() {
      window.location.reload()
    })
  }

  render() {
    return (
      <table className={styles.header_wrapper}>
        <tbody>
          <tr>
            <td className={styles.header_logo}>
              <a href="/">
                <img src="/coder-news-icon.png" />
              </a>
            </td>
            <td className={styles.header_links}>
              <span className={styles.header_links_items}>
                <b className={styles.header_links_name}>
                  <Link href="/news">
                    <a>Coder News</a>
                  </Link>
                </b>
                <Link href="/newest">
                  <a className={this.props.pageName === "newest" ? styles.white_text : null}>new</a>
                </Link>
                <span> | </span>
                {
                  this.props.userSignedIn ?
                  <>
                    <Link href={`/threads?id=${this.props.username}`}>
                      <a className={this.props.pageName === "threads" ? styles.white_text : null}>threads</a>
                    </Link>
                    <span> | </span>
                  </> : null
                }
                <Link href="/past">
                  <a className={this.props.pageName === "past" ? styles.white_text : null}>past</a>
                </Link>
                <span> | </span>
                <Link href="/newcomments">
                  <a className={this.props.pageName === "newcomments" ? styles.white_text : null}>comments</a>
                </Link>
                <span> | </span>
                <Link href="/ask">
                  <a className={this.props.pageName === "ask" ? styles.white_text : null}>ask</a>
                </Link>
                <span> | </span>
                <Link href="/show">
                  <a className={this.props.pageName === "show" ? styles.white_text : null}>show</a>
                </Link>
                <span> | </span>
                <Link href="/submit">
                  <a className={this.props.pageName === "submit" ? styles.white_text : null}>submit</a>
                </Link>
                {
                  this.props.label ?
                  <>
                    <span> | </span>
                    <span className={styles.white_text}>{this.props.label}</span>
                  </> : null
                }
              </span>
            </td>
            <td className={styles.header_right_nav_links}>
              <span className={styles.header_right_nav_links_items}>
                {
                  this.props.userSignedIn ?
                  <>
                    <a href={`/user?id=${this.props.username}`}>{this.props.username}</a>
                    <span> ({this.props.karma.toLocaleString()})</span>
                    <span> | </span>
                    <span className={styles.header_logout} onClick={this.requestLogout}>logout</span>
                  </> :
                  <>
                    <a href={`/login${this.props.goto ? "?goto=" + encodeURIComponent(this.props.goto) : ""}`}>
                      <span>login</span>
                    </a>
                  </>
                }
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}
