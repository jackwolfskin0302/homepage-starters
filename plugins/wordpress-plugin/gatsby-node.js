exports.createSchemaCustomization = async ({ actions }) => {
  actions.createFieldExtension({
    name: "wpImagePassthroughResolver",
    extend(options) {
      return {
        async resolve(source, args, context, info) {
          const imageType = info.schema.getType("ImageSharp")
          const file = context.nodeModel.getNodeById(source.localFile)
          const image = context.nodeModel.getNodeById({
            id: file.children[0],
          })
          const resolver = imageType.getFields().gatsbyImageData.resolve
          if (!resolver) return null
          return await resolver(image, args, context, info)
        },
      }
    },
  })

  actions.createFieldExtension({
    name: "wpRecursiveImage",
    extend(options) {
      return {
        async resolve(source, args, context, info) {
          return source
        },
      }
    },
  })

  actions.createTypes(/* GraphQL */ `
    interface HomepageImage implements Node {
      id: ID!
      alt: String
      gatsbyImageData: JSON
      image: HomepageImage
      localFile: File
      url: String
    }
  `)

  // blocks
  actions.createTypes(/* GraphQL */ `
    interface HomepageBlock implements Node {
      id: ID!
      blocktype: String
    }
    type HomepageLink implements Node {
      id: ID!
      href: String
      text: String
    }
    type HomepageHero implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String!
      kicker: String
      subhead: String
      image: HomepageImage @link
      text: String
      links: [HomepageLink] @link
    }

    type HomepageCta implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      text: String
      links: [HomepageLink] @link
      image: HomepageImage @link
    }

    type HomepageFeature implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      kicker: String
      text: String
      image: HomepageImage @link
      links: [HomepageLink] @link
    }

    type HomepageTestimonial implements Node {
      id: ID!
      quote: String
      source: String
      avatar: HomepageImage @link
    }

    type HomepageBenefit implements Node {
      id: ID!
      heading: String
      text: String
      image: HomepageImage @link
    }

    type HomepageLogo implements Node {
      id: ID!
      image: HomepageImage @link
      alt: String @proxy(from: "image.title")
    }

    type HomepageProduct implements Node {
      id: ID!
      heading: String
      text: String
      image: HomepageImage @link
      links: [HomepageLink] @link
    }

    type HomepageFeatureList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      text: String
      content: [HomepageFeature] @link
    }

    type HomepageLogoList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      text: String
      logos: [HomepageImage] @link
    }

    type HomepageTestimonialList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      content: [HomepageTestimonial] @link
    }

    type HomepageBenefitList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      text: String
      content: [HomepageBenefit] @link
    }

    type HomepageStat implements Node {
      id: ID!
      value: String
      label: String
      heading: String
    }

    type HomepageStatList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      text: String
      image: HomepageImage @link
      icon: HomepageImage @link
      content: [HomepageStat] @link
      links: [HomepageLink] @link
    }

    type HomepageProductList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      text: String
      content: [HomepageProduct] @link
    }

    type AboutHero implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      text: String
      image: HomepageImage @link
    }

    type AboutStat implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      value: String
      label: String
    }

    type AboutStatList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      content: [AboutStat] @link
    }

    type AboutProfile implements Node {
      id: ID!
      image: HomepageImage @link
      name: String
      jobTitle: String
    }

    type AboutLeadership implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      subhead: String
      content: [AboutProfile] @link
    }

    type AboutLogoList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      links: [HomepageLink] @link
      logos: [HomepageImage] @link
    }
  `)

  // pages
  actions.createTypes(/* GraphQL */ `
    type Homepage implements Node {
      id: ID!
      title: String
      description: String
      image: HomepageImage @link
      content: [HomepageBlock] @link
    }

    type AboutPage implements Node {
      id: ID!
      title: String
      description: String
      image: HomepageImage @link
      content: [HomepageBlock] @link
    }

    type Page implements Node {
      id: ID!
      slug: String!
      title: String
      description: String
      image: HomepageImage @link
      html: String
    }
  `)

  // WordPress types
  actions.createTypes(/* GraphQL */ `
    type WpMediaItem implements Node & HomepageImage {
      id: ID!
      alt: String @proxy(from: "altText")
      altText: String
      gatsbyImageData: JSON @wpImagePassthroughResolver
      image: HomepageImage @wpRecursiveImage
      localFile: File
      url: String @proxy(from: "mediaItemUrl")
      mediaItemUrl: String
    }
  `)
}

exports.onCreateNode = ({
  node,
  actions,
  getNode,
  createNodeId,
  createContentDigest,
  reporter,
}) => {
  if (!node.internal.type.includes("Wp")) return

  /*
    if (node.internal.type === "WpHomepageBlock") {
      if (node.blocktypes.nodes.length < 1) return
      const blocktype = getNode(node.blocktypes.nodes[0].id)
      switch (blocktype.name) {
        case "Hero":
          actions.createNode({
            ...node.hero,
            id: createNodeId(`${node.id} >>> HomepageHero`),
            internal: {
              type: "HomepageHero",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "HomepageHero",
            parent: node.id,
            originalId: node.id,
            image: node.hero.image?.id,
            links: node.hero.links?.map((link) => link.id),
          })
          break
        case "Cta":
          actions.createNode({
            ...node.cta,
            id: createNodeId(`${node.id} >>> HomepageCta`),
            internal: {
              type: "HomepageCta",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "HomepageCta",
            originalId: node.id,
            parent: node.id,
            image: node.cta.image?.id,
            links: node.cta.links?.map((link) => link.id),
          })
          break
        case "Feature":
          actions.createNode({
            ...node.feature,
            id: createNodeId(`${node.id} >>> HomepageFeature`),
            internal: {
              type: "HomepageFeature",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "HomepageFeature",
            originalId: node.id,
            parent: node.id,
            image: node.feature.image?.id,
            links: node.feature.links?.filter(Boolean).map((link) => link.id),
          })
          break
        case "FeatureList":
          actions.createNode({
            ...node.featureList,
            id: createNodeId(`${node.id} >>> HomepageFeatureList`),
            internal: {
              type: "HomepageFeatureList",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "HomepageFeatureList",
            originalId: node.id,
            parent: node.id,
            content: node.featureList.content?.map((item) => item.id),
          })
          break
        case "BenefitList":
          actions.createNode({
            ...node.benefitList,
            id: createNodeId(`${node.id} >>> HomepageBenefitList`),
            internal: {
              type: "HomepageBenefitList",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "HomepageBenefitList",
            originalId: node.id,
            parent: node.id,
            content: node.benefitList.content?.map((item) => item.id),
          })
          break
        case "LogoList":
          actions.createNode({
            ...node.logoList,
            id: createNodeId(`${node.id} >>> HomepageLogoList`),
            internal: {
              type: "HomepageLogoList",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "HomepageLogoList",
            originalId: node.id,
            parent: node.id,
            logos: node.logoList.logos?.map((logo) => logo.id),
          })
          break
        case "AboutLogoList":
          actions.createNode({
            ...node.aboutLogoList,
            id: createNodeId(`${node.id} >>> AboutLogoList`),
            internal: {
              type: "AboutLogoList",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "AboutLogoList",
            originalId: node.id,
            parent: node.id,
            logos: node.aboutLogoList.logos?.map((logo) => logo.id),
            links: node.aboutLogoList.links?.map((link) => link.id),
          })
          break
        case "ProductList":
          actions.createNode({
            ...node.productList,
            id: createNodeId(`${node.id} >>> HomepageProductList`),
            internal: {
              type: "HomepageProductList",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "HomepageProductList",
            originalId: node.id,
            parent: node.id,
            content: node.productList.content?.map((item) => item.id),
          })
          break
        case "StatList":
          actions.createNode({
            ...node.statList,
            id: createNodeId(`${node.id} >>> HomepageStatList`),
            internal: {
              type: "HomepageStatList",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "HomepageStatList",
            originalId: node.id,
            parent: node.id,
            icon: node.statList.icon?.id,
            image: node.statList.image?.id,
            content: node.statList.content?.map((item) => item.id),
            links: node.statList.links?.map((link) => link.id),
          })
          break
        case "TestimonialList":
          actions.createNode({
            ...node.testimonialList,
            id: createNodeId(`${node.id} >>> HomepageTestimonialList`),
            internal: {
              type: "HomepageTestimonialList",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "HomepageTestimonialList",
            originalId: node.id,
            parent: node.id,
            content: node.testimonialList.content?.map((item) => item.id),
          })
          break
        case "AboutHero":
          actions.createNode({
            ...node.aboutHero,
            id: createNodeId(`${node.id} >>> AboutHero`),
            internal: {
              type: "AboutHero",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "AboutHero",
            parent: node.id,
            originalId: node.id,
            image: node.aboutHero.image?.id,
          })
          break
        case "AboutStatList":
          actions.createNode({
            id: createNodeId(`${node.id} >>> AboutStatList`),
            internal: {
              type: "AboutStatList",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "AboutStatList",
            parent: node.id,
            originalId: node.id,
            content: node.aboutStatList.content?.map((item) => item.id),
          })
          break
        case "AboutLeadership":
          actions.createNode({
            ...node.aboutLeadership,
            id: createNodeId(`${node.id} >>> AboutLeadership`),
            internal: {
              type: "AboutLeadership",
              contentDigest: node.internal.contentDigest,
            },
            blocktype: "AboutLeadership",
            parent: node.id,
            originalId: node.id,
            content: node.aboutLeadership.content?.map((item) => item.id),
          })
          break
        default:
          reporter.warn(
            `Unknown HomepageBlock type: ${blocktype.name} sourced from WordPress. This will not be used.`
          )
          break
      }
    } else if (node.internal.type === "WpHomepageItem") {
      if (node.categories.nodes.length < 1) return
      const category = getNode(node.categories.nodes[0].id)
      if (!category) {
        reporter.warn(`No category found for ${node.id} ${node.title} – skipping`)
        return
      }
      switch (category.name) {
        case "Benefit":
          actions.createNode({
            ...node.benefit,
            id: createNodeId(`${node.id} >>> Benefit`),
            internal: {
              type: "HomepageBenefit",
              contentDigest: node.internal.contentDigest,
            },
            parent: node.id,
            originalId: node.id,
            image: node.benefit.image?.id,
          })
          break
        case "Product":
          actions.createNode({
            ...node.product,
            id: createNodeId(`${node.id} >>> Product`),
            internal: {
              type: "HomepageProduct",
              contentDigest: node.internal.contentDigest,
            },
            parent: node.id,
            originalId: node.id,
            image: node.product.image?.id,
            links: node.product.links?.map((link) => link.id),
          })
          break
        case "Stat":
          actions.createNode({
            ...node.stat,
            id: createNodeId(`${node.id} >>> Stat`),
            internal: {
              type: "HomepageStat",
              contentDigest: node.internal.contentDigest,
            },
            parent: node.id,
            originalId: node.id,
          })
          break
        case "Testimonial":
          actions.createNode({
            ...node.testimonial,
            id: createNodeId(`${node.id} >>> Testimonial`),
            internal: {
              type: "HomepageTestimonial",
              contentDigest: node.internal.contentDigest,
            },
            parent: node.id,
            originalId: node.id,
            avatar: node.testimonial.avatar?.id,
          })
          break
        case "AboutStat":
          actions.createNode({
            ...node.aboutStat,
            id: createNodeId(`${node.id} >>> AboutStat`),
            internal: {
              type: "AboutStat",
              contentDigest: node.internal.contentDigest,
            },
            parent: node.id,
            originalId: node.id,
          })
          break
        case "AboutProfile":
          actions.createNode({
            ...node.aboutProfile,
            id: createNodeId(`${node.id} >>> AboutProfile`),
            internal: {
              type: "AboutProfile",
              contentDigest: node.internal.contentDigest,
            },
            parent: node.id,
            originalId: node.id,
            image: node.aboutProfile.image?.id,
          })
          break
        default:
          reporter.warn(
            `Unknown HomepageItem category: ${category.name} sourced from WordPress. This will not be used.`
          )
      }
    }
  */

  const createLinkNode =
    (parent) =>
    ({ url, title, ...rest }, i) => {
      const id = createNodeId(`${parent.id} >>> HomepageLink ${url} ${i}`)
      actions.createNode({
        id,
        internal: {
          type: "HomepageLink",
          contentDigest: createContentDigest({ url, title }),
        },
        href: url,
        text: title,
      })
      return id
    }

  const createItemNode = (parent, type) => (data, i) => {
    const id = createNodeId(`${parent.id} >>> ${type} ${i}`)
    if (data.image) {
      data.image = data.image?.id
    }
    if (Array.isArray(data.link)) {
      data.links = data.link.filter(Boolean).map(createLinkNode(parent))
    }
    actions.createNode({
      ...data,
      id,
      internal: {
        type,
        contentDigest: createContentDigest(data),
      },
    })
    return id
  }

  if (node.internal.type === "WpPage") {
    switch (node.slug) {
      case "homepage":
        console.log(node.homepage)
        const { hero, logoList, featureList, productList } = node.homepage

        const content = {
          features: [featureList.feature1, featureList.feature2]
            .filter(Boolean)
            .map((feature) => ({
              ...feature,
              blocktype: "Feature",
            }))
            .map(createItemNode(node, "HomepageFeature")),
          products: [
            productList.product1,
            productList.product2,
            productList.product3,
          ]
            .filter(Boolean)
            .map(createItemNode(node, "HomepageProduct")),
          // benefits: [],
          // testimonials: [],
          // stats: [],
        }

        const blocks = {
          hero: {
            id: createNodeId(`${node.id} >>> HomepageHero`),
            ...hero,
            image: hero.image?.id,
            links: [hero.cta1, hero.cta2]
              .map(createLinkNode(node.id))
              .filter(Boolean),
          },
          logoList: {
            id: createNodeId(`${node.id} >>> HomepageLogoList`),
            ...logoList,
            logos: logoList.logos.filter(Boolean).map((logo) => logo.id),
          },
          featureList: {
            id: createNodeId(`${node.id} >>> HomepageFeatureList`),
            ...featureList,
            content: content.features,
          },
          productList: {
            id: createNodeId(`${node.id} >>> HomepageProductList`),
            ...productList,
            content: content.products,
          },
        }

        actions.createNode({
          ...blocks.hero,
          blocktype: "HomepageHero",
          internal: {
            type: "HomepageHero",
            contentDigest: node.internal.contentDigest,
          },
        })

        actions.createNode({
          ...blocks.logoList,
          blocktype: "HomepageLogoList",
          internal: {
            type: "HomepageLogoList",
            contentDigest: node.internal.contentDigest,
          },
        })

        actions.createNode({
          ...blocks.featureList,
          blocktype: "HomepageFeatureList",
          internal: {
            type: "HomepageFeatureList",
            contentDigest: node.internal.contentDigest,
          },
        })

        actions.createNode({
          ...blocks.productList,
          blocktype: "HomepageProductList",
          internal: {
            type: "HomepageProductList",
            contentDigest: node.internal.contentDigest,
          },
        })

        actions.createNode({
          ...node.homepage,
          id: createNodeId(`${node.id} >>> Homepage`),
          internal: {
            type: "Homepage",
            contentDigest: node.internal.contentDigest,
          },
          parent: node.id,
          title: node.title,
          image: node.featuredImage?.node?.id,
          content: [
            blocks.hero.id,
            blocks.logoList.id,
            blocks.productList.id,
            blocks.featureList.id,
          ],
        })
        break
      /*
        case "about":
          actions.createNode({
            ...node.homepage,
            id: createNodeId(`${node.id} >>> AboutPage`),
            internal: {
              type: "AboutPage",
              contentDigest: node.internal.contentDigest,
            },
            parent: node.id,
            title: node.title,
            image: node.featuredImage?.node?.id,
            // content: node.homepage?.blocks?.map((block) => block.id),
          })
          break
        */
      default:
        actions.createNode({
          ...node.page,
          id: createNodeId(`${node.id} >>> Page ${node.slug}`),
          internal: {
            type: "Page",
            contentDigest: node.internal.contentDigest,
          },
          parent: node.id,
          slug: node.slug,
          title: node.title,
          description: node.page?.description,
          image: node.featuredImage?.node?.id,
          html: node.content,
        })
        break
    }
  }
}
