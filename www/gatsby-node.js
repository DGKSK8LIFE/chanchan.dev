const path = require('path')
const {createFilePath} = require(`gatsby-source-filesystem`)

exports.createPages = async ({graphql, actions}) => {
  const {createPage} = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          filter: {fields: {draft: {eq: false}, collection: {eq: "blog"}}}
          sort: {fields: [frontmatter___date], order: DESC}
          limit: 1000
        ) {
          edges {
            node {
              fileAbsolutePath
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `,
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges

  posts.forEach((post, index) => {
    const previous = index === 0 ? null : posts[index - 1].node
    const next = index === posts.length - 1 ? null : posts[index + 1].node
    const relativePath = getContentFilename(post.node.fileAbsolutePath)

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
        relativePath,
      },
    })
  })
}

const CONTENT_REGEX = /\/www\/content\/.*/
const getContentFilename = filename => {
  if (!filename) return
  const match = filename.match(CONTENT_REGEX)
  return match ? match[0] : null
}

exports.onCreateNode = ({
  node,
  actions,
  getNode,
  getNodes,
  createNodeId,
  createContentDigest,
}) => {
  const {createNodeField} = actions

  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({node, getNode})
    const collection = getNode(node.parent).sourceInstanceName
    createNodeField({
      name: `slug`,
      node,
      value: slug,
    })
    createNodeField({
      name: `collection`,
      node,
      value: collection,
    })
  }
}
