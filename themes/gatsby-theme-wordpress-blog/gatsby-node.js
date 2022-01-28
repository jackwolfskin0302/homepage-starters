const path = require("path")

exports.createSchemaCustomization = async ({ actions }) => {
  actions.createTypes(`
    interface BlogPostBody implements Node {
      id: ID!
      childMarkdownRemark: MarkdownRemark
    }

    interface BlogPost implements Node {
      id: ID!
      slug: String!
      title: String!
      html: String!
      # TODO
      # date # image # author
    }
  `)

  actions.createTypes(`
    type WpPost implements Node & BlogPost {
      id: ID!
      slug: String!
      title: String!
      html: String! @proxy(from: "content")
    }
  `)
}
