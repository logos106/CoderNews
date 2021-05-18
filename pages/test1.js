
export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`http://localhost/joe/test/test.php`)
  const data = await res.json()

  // Pass data to the page via props
  return { props: { data } }
}

export default function FirstPost({ data }) {
  return (
    <ul>
      {data.map((post) => (
        <li>{post.title}</li>
      ))}
    </ul>
    // <Layout>
    //   <Head>
    //     <title>First Post</title>
    //   </Head>
    //   <h1>First Post</h1>
    //   <h2>
    //     <Link href="/">
    //       <a>Back to home</a>
    //     </Link>
    //   </h2>
    // </Layout>
  )
}
