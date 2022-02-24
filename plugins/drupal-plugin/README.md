<a href="https://www.gatsbyjs.com">
  <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
</a>

# Gatsby Starter Drupal Homepage

Create a homepage using Gatsby and Drupal. This starter demonstrates how to use Drupal to build a homepage and can be customized to match your own visual branding.

[View the Demo](https://gatsbydrupalhomepage.gatsbyjs.io/)

## Quick start

You will need a new or existing `Drupal` website to use this starter and will be asked for your `baseUrl` and the `username` and `password` for your `Drupal` during installation.

1. **Create a Gatsby site**

   Use the Gatsby CLI to get started locally:

   ```sh name
   npx gatsby new my-homepage https://github.com/gatsbyjs/gatsby-starter-drupal-homepage
   ```

1. **Import content to your Drupal instance**

   For this implementation we used `Pantheon` as our host. So some configurations may be specific to that platform. Before importing the `sql` dump file we recommend adding the `files` folder located in the `data` directory to your drupal site under `sites/default/` or wherever your `files` folder is located on your instance. Afterwards you may use the `sql` dump file provided in the `data` directory of app called `homepage-starter-dump.sql.gz`. Depending on the setup, you may have to extract the `sql` file before trying to import the data.

   ### Lando

   A free, open source, cross-platform, local development environment and DevOps tool built on Docker container technology and developed by Tandem. [See the docs](https://docs.lando.dev/).

   ```sh
   # This will destroy the database and import the data.
   # If you wish to keep you existing data add the --no-wipe flag.
   lando db-import ~/path/to/homepage-starter-dump.sql
   ```

   ### Drush

   For more information on how to use drush commands and how to install the command line shell visit [Drush Documentation Site](https://www.drush.org/latest/).

   ```sh
   # If you wish to start from a clean site
   drush sql-drop
   drush sql-cli < ~/path/to/homepage-starter-dump.sql
   ```

   An `admin` user already exists in the application. You will have to reset the password if you decide to start from a clean site.

   ```sh
   # Drush 9
   drush user:password admin "new_password"

   # Drush 8 & earlier
   drush user-password admin --password="new_password"
   ```

1. **Start developing**

   In your site directory, start the development server:

   ```sh
   yarn start
   ```

   Your site should now be running at <http://localhost:8000>

1. **Open the source code and start editing**

## Deploy your site

Once your content is available in Drupal, deploy your site to [Gatsby Cloud](https://gatsbyjs.com/products/cloud):

[![Deploy to Gatsby](https://www.gatsbyjs.com/deploynow.png "Deploy to Gatsby")](https://www.gatsbyjs.com/dashboard/deploynow?url=https://github.com/gatsbyjs/gatsby-starter-drupal-homepage)

## Setting up Gatsby Cloud Preview

## What's included?

```sh
├── README.md
├── gatsby-config.js
├── gatsby-node.js
├── src
│   ├── components
│   ├── pages
│   ├── colors.css.ts
│   ├── styles.css.ts
│   └── theme.css.ts
└── .env.EXAMPLE
```

1. **`gatsby-config.js`**: [Gatsby config][] file that includes plugins required for this starter.
1. **`gatsby-node.js`**: [Gatsby Node][] config file that creates an abstract data model for the homepage content.
1. **`src/`**: The source directory for the starter, including pages, components, and [Vanilla Extract][] files for styling.

[gatsby config]: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
[gatsby node]: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
[vanilla extract]: https://vanilla-extract.style/

## How to

### Update the color theme

To update the colors used in this starter, edit the `src/colors.css.ts` file.

```.ts
// src/colors.css.ts
export const colors = {
  background: "#eff6ff",
  text: "#004ca3",
  primary: "#004ca3",
  muted: "#e6f1ff",
  active: "#001d3d",
  black: "#000",
}

```

If you'd like to add additional colors, add additional keys to this object.
This file is imported into `src/theme.css.ts` and creates CSS custom properties, that can be imported and used in other `.css.ts` files.

The UI components file `src/components/ui.js` imports styles from `src/components/ui.css.ts`. You can see how the theme and color values are being used in this file.

### Add your logo

![Logo](./docs/images/logo.png)

Replace the `src/components/brand-logo.js` component with your own brand logo.
If you have an SVG version, it can be rendered inline as a React component, following the example in this file. Note that SVG attributes will need to be camel cased for JSX.

Using an inline SVG for the logo allows it to pick up the colors used in CSS, which is how the logo colors are inverted for the mobile menu.

If you prefer to use an image, use the [`StaticImage`](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/#staticimage) component from `gatsby-plugin-image` in place of the SVG in this file.

### Customize headings, buttons, and other styles

![Headings & Buttons](./docs/images/headings-buttons.png)

To further customize the look and feel of the homepage, edit the UI components in `src/components/ui.js` and styles in `src/components/ui.css.ts`.

### Customize section components

To customize any of the sections of the homepage, edit the relevant component in `src/components`.
Most of the styles for these components are handled with shared UI components in `src/components/ui.js`.

### Create custom section components

To create a new type of section in your homepage, you'll want to create a new section component. Using the existing components as an example.
For this example, we'll create a new "Banner" component.

1. First, update your content model in Drupal

   In your Drupal website, create a new content type and call it "Homepage Banner."
   For this example, change the `Title` field's name to `Heading` in when creating your new content type. Remove any fields that are added dy default and create a new field called `text` this should be of `Text (plain, long)` data type.

   Find the content type for _Homepage_ in Drupal and edit the settings for the _Content_ field. Under `Reference Type -> Content Type`, ensure that the new _Homepage Banner_ type is checked to make it available as a content type on the Homepage.

   Navigate to the _Content_ page to edit the _Homepage_ and add a section with this new _Homepage Banner_ content type.

1. Update `gatsby-node.js`

   Edit your site's `gatsby-node.js` file, adding an interface for `HomepageBanner` that matches your content model in Drupal.
   This allows the homepage to query the abstract `HomepageBanner` type.

   ```js
   // in gatsby-node.js
   exports.createSchemaCustomization = async ({ actions }) => {
     // ...
     actions.createTypes(`
       interface HomepageBanner implements Node & HomepageBlock {
         id: ID!
         blocktype: String
         heading: String
         text: String
       }
     `)
     // ...
     actions.createTypes(`
       type node__homepage_banner implements Node & HomepageBanner & HomepageBlock @dontInfer {
         id: ID!
         blocktype: String @blocktype
         heading: String
         text: String
       }
     `)
     // ...
   }
   ```

1. Next, create the Banner component:

   ```jsx
   // src/components/banner.js
   import * as React from "react"
   import { graphql } from "gatsby"
   import { Section, Container, Heading, Text } from "./ui"

   export default function Banner(props) {
     return (
       <Section>
         <Container>
           <Heading>{props.heading}</Heading>
           <Text>{props.text}</Text>
         </Container>
       </Section>
     )
   }

   export const query = graphql`
     fragment HomepageBannerContent on HomepageBanner {
       id
       heading
       text
     }
   `
   ```

1. Export the component from `src/components/sections.js`

   ```js
   // src/components/sections.js
   export { default as HomepageHero } from "./hero"
   export { default as HomepageFeature } from "./feature"
   export { default as HomepageFeatureList } from "./feature-list"
   export { default as HomepageLogoList } from "./logo-list"
   export { default as HomepageBenefitList } from "./benefit-list"
   export { default as HomepageTestimonialList } from "./testimonial-list"
   export { default as HomepageStatList } from "./stat-list"
   export { default as HomepageCta } from "./cta"
   export { default as HomepageProductList } from "./product-list"

   // add export for new component
   export { default as HomepageBanner } from "./banner"
   ```

1. Add the GraphQL query fragment to the query in `src/pages/index.js`

   ```js
   // in src/pages/index.js
   export const query = graphql`
     {
       homepage {
         id
         title
         description
         image {
           id
           url
         }
         blocks: content {
           id
           blocktype
           ...HomepageHeroContent
           ...HomepageFeatureContent
           ...HomepageFeatureListContent
           ...HomepageCtaContent
           ...HomepageLogoListContent
           ...HomepageTestimonialListContent
           ...HomepageBenefitListContent
           ...HomepageStatListContent
           ...HomepageProductListContent
           # New component fragment
           ...HomepageBannerContent
         }
       }
     }
   `
   ```

## 🎓 Learning Gatsby

Looking for more guidance? Full documentation for Gatsby lives [on the website](https://www.gatsbyjs.com/). Here are some places to start:

- **For most developers, we recommend starting with our [in-depth tutorial for creating a site with Gatsby](https://www.gatsbyjs.com/tutorial/).** It starts with zero assumptions about your level of ability and walks through every step of the process.
- **To dive straight into code samples, head [to our documentation](https://www.gatsbyjs.com/docs/).**

## 💫 Deploy

[Build, Deploy, and Host On The Only Cloud Built For Gatsby](https://www.gatsbyjs.com/cloud/)

Gatsby Cloud is an end-to-end cloud platform specifically built for the Gatsby framework that combines a modern developer experience with an optimized, global edge network.
