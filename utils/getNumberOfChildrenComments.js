export default function getNumberOfChildrenComments(comment, count) {
  count = count || 0
  for (let child of comment.children) {
    count += 1

    if (child.children) {
      count = getNumberOfChildrenComments(child, count)
    }
  }

  return count
}
