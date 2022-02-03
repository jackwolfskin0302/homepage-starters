const formatAsNodeType = (str) => {
  const base = str.replace("node__", "")
  const type = base
    .split("_")
    .map(
      (section) =>
        `${section.substring(0, 1).toUpperCase()}${section.substring(1)}`
    )
    .join("")
  const internalType = base.toLowerCase()
  return [type, internalType]
}

exports.createSchemaCustomization = async ({ actions }) => {
  actions.createFieldExtension({
    name: "blocktype",
    extend(options) {
      return {
        resolve(source) {
          return formatAsNodeType(source.internal.type)[0]
        },
      }
    },
  })

  actions.createFieldExtension({
    name: "imageUrl",
    extend(options) {
      return {
        async resolve(source, args, context, info) {
          const fieldMediaImage = context.nodeModel.getNodeById({
            id: source.relationships.field_media_image___NODE,
          })
          const localFile = context.nodeModel.getNodeById({
            id: fieldMediaImage.localFile___NODE,
          })
          return localFile.url
        },
      }
    },
  })

  actions.createFieldExtension({
    name: "proxyImage",
    extend(options) {
      return {
        async resolve(source, args, context, info) {
          const imageType = info.schema.getType("ImageSharp")
          const fieldMediaImage = context.nodeModel.getNodeById({
            id: source.relationships.field_media_image___NODE,
          })
          const localFile = context.nodeModel.getNodeById({
            id: fieldMediaImage.localFile___NODE,
          })
          const image = context.nodeModel.getNodeById({
            id: localFile.children[0],
          })
          const resolver = imageType.getFields().gatsbyImageData.resolve
          if (!resolver) return null
          return await resolver(image, args, context, info)
        },
      }
    },
  })

  // abstract interfaces
  actions.createTypes(/* GraphQL */ `
    interface HomepageBlock implements Node {
      id: ID!
      blocktype: String
    }

    interface HomepageLink implements Node {
      id: ID!
      href: String
      text: String
    }

    interface HomepageImage implements Node {
      id: ID!
      alt: String
      gatsbyImageData: JSON
      url: String
    }

    interface HomepageHero implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      kicker: String
      subhead: String
      image: HomepageImage
      text: String
      links: [HomepageLink]
    }

    interface HomepageFeature implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      kicker: String
      text: String
      image: HomepageImage
      links: [HomepageLink]
    }

    interface HomepageFeatureList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      text: String
      content: [HomepageFeature]
    }

    interface HomepageCta implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      text: String
      image: HomepageImage
      links: [HomepageLink]
    }

    interface HomepageLogo implements Node {
      id: ID!
      image: HomepageImage
      alt: String
    }

    interface HomepageLogoList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      name: String
      text: String
      logos: [HomepageLogo]
    }

    interface HomepageTestimonial implements Node {
      id: ID!
      quote: String
      source: String
      avatar: HomepageImage
    }

    interface HomepageTestimonialList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      content: [HomepageTestimonial]
    }

    interface HomepageBenefit implements Node {
      id: ID!
      heading: String
      text: String
      image: HomepageImage
    }

    interface HomepageBenefitList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      text: String
      content: [HomepageBenefit]
    }

    interface HomepageStat implements Node {
      id: ID!
      value: String
      label: String
      heading: String
    }

    interface HomepageStatList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      text: String
      image: HomepageImage
      icon: HomepageImage
      content: [HomepageStat]
      links: [HomepageLink]
    }

    interface HomepageProduct implements Node {
      id: ID!
      heading: String
      text: String
      image: HomepageImage
      links: [HomepageLink]
    }

    interface HomepageProductList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      kicker: String
      text: String
      content: [HomepageProduct]
    }

    interface Homepage implements Node {
      id: ID!
      title: String
      description: String
      image: HomepageImage
      content: [HomepageBlock]
    }

    interface LayoutHeader implements Node {
      id: ID!
      links: [HomepageLink]
      cta: HomepageLink
    }

    enum SocialService {
      TWITTER
      FACEBOOK
      INSTAGRAM
      YOUTUBE
      LINKEDIN
      GITHUB
      DISCORD
      TWITCH
    }

    interface SocialLink implements Node {
      id: ID!
      username: String!
      service: SocialService!
    }

    interface LayoutFooter implements Node {
      id: ID!
      links: [HomepageLink]
      meta: [HomepageLink]
      socialLinks: [SocialLink]
      copyright: String
    }

    interface Layout implements Node {
      id: ID!
      header: LayoutHeader
      footer: LayoutFooter
    }
  `)

  // CMS-specific types
  actions.createTypes(/* GraphQL */ `
    type node__homepage_link implements Node & HomepageLink @dontInfer {
      id: ID!
      href: String @proxy(from: "field_href")
      text: String @proxy(from: "title")
    }

    type media__image implements Node & HomepageImage {
      id: ID!
      alt: String @proxy(from: "field_media_image.alt")
      gatsbyImageData: JSON @proxyImage
      url: String @imageUrl
      title: String
    }

    type node__homepage_hero implements Node & HomepageHero & HomepageBlock {
      id: ID!
      blocktype: String @blocktype
      heading: String @proxy(from: "title")
      kicker: String @proxy(from: "field_kicker")
      subhead: String @proxy(from: "field_subhead")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      text: String @proxy(from: "field_text")
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
    }

    type node__homepage_feature implements Node & HomepageBlock & HomepageFeature
      @dontInfer {
      blocktype: String @blocktype
      heading: String @proxy(from: "title")
      kicker: String @proxy(from: "field_kicker")
      text: String @proxy(from: "field_text")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
    }
    type node__homepage_feature_list implements Node & HomepageBlock & HomepageFeatureList
      @dontInfer {
      blocktype: String @blocktype
      kicker: String @proxy(from: "field_kicker")
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      content: [HomepageFeature]
        @link(by: "id", from: "relationships.field_content___NODE")
    }

    type node__homepage_cta implements Node & HomepageBlock & HomepageCta
      @dontInfer {
      blocktype: String @blocktype
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
    }

    type node__homepage_logo implements Node & HomepageLogo @dontInfer {
      id: ID!
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      alt: String @proxy(from: "title")
    }

    type node__homepage_logo_list implements Node & HomepageBlock & HomepageLogoList
      @dontInfer {
      blocktype: String @blocktype
      name: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      logos: [HomepageLogo]
        @link(by: "id", from: "relationships.field_logos___NODE")
    }

    type node__homepage_testimonial implements Node & HomepageTestimonial
      @dontInfer {
      id: ID!
      quote: String @proxy(from: "field_quote")
      source: String @proxy(from: "title")
      avatar: HomepageImage
        @link(by: "id", from: "relationships.field_avatar___NODE")
    }

    type node__homepage_testimonial_list implements Node & HomepageBlock & HomepageTestimonialList
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      kicker: String @proxy(from: "field_kicker")
      heading: String @proxy(from: "title")
      content: [HomepageTestimonial]
        @link(by: "id", from: "relationships.field_content___NODE")
    }

    type node__home_page_benefit implements Node & HomepageBenefit @dontInfer {
      id: ID!
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
    }

    type node__homepage_benefit_list implements Node & HomepageBlock & HomepageBenefitList
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      content: [HomepageBenefit]
        @link(by: "id", from: "relationships.field_content___NODE")
    }

    type node__homepage_stat implements Node & HomepageBlock & HomepageStat
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      heading: String @proxy(from: "field_heading")
      label: String @proxy(from: "field_label")
      value: String @proxy(from: "title")
    }

    type node__homepage_stat_list implements Node & HomepageBlock & HomepageStatList
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      kicker: String @proxy(from: "field_kicker")
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      icon: HomepageImage
        @link(by: "id", from: "relationships.field_icon___NODE")
      content: [HomepageStat]
        @link(by: "id", from: "relationships.field_content___NODE")
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
    }

    type node__homepage_product implements Node & HomepageProduct @dontInfer {
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
    }

    type node__homepage_product_list implements Node & HomepageProductList & HomepageBlock
      @dontInfer {
      blocktype: String @blocktype
      heading: String @proxy(from: "title")
      kicker: String @proxy(from: "field_kicker")
      text: String @proxy(from: "field_text")
      content: [HomepageProduct]
        @link(by: "id", from: "relationships.field_content___NODE")
    }

    type node__homepage implements Node & Homepage @dontInfer {
      id: ID!
      title: String
      description: String @proxy(from: "field_description")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      content: [HomepageBlock]
        @link(by: "id", from: "relationships.field_content___NODE")
    }
  `)

  // Layout types
  actions.createTypes(/* GraphQL */ `
    type node__layout_header implements Node & LayoutHeader @dontInfer {
      id: ID!
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
      cta: HomepageLink @link(by: "id", from: "relationships.field_cta___NODE")
    }

    type node__social_link implements Node & SocialLink @dontInfer {
      id: ID!
      username: String! @proxy(from: "field_username")
      service: SocialService! @proxy(from: "title")
    }

    type node__layout_footer implements Node & LayoutFooter @dontInfer {
      id: ID!
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
      meta: [HomepageLink]
        @link(by: "id", from: "relationships.field_meta___NODE")
      socialLinks: [SocialLink]
        @link(by: "id", from: "relationships.field_social_links___NODE")
      copyright: String @proxy(from: "field_copyright")
    }

    type node__layout implements Node & Layout @dontInfer {
      id: ID!
      header: LayoutHeader
        @link(by: "id", from: "relationships.field_header___NODE")
      footer: LayoutFooter
        @link(by: "id", from: "relationships.field_footer___NODE")
    }
  `)
}
