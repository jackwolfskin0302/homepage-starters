import * as React from "react"
import { graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import {
  Container,
  Section,
  Flex,
  Box,
  Subhead,
  Kicker,
  Text,
  ButtonList,
  HomepageImage,
  HomepageLink,
} from "./ui"
import { Backgrounds, FlexVariants, TextVariants, Widths } from "./ui.css"

export interface FeatureProps {
  id: string
  image?: HomepageImage
  flip: boolean
  kicker?: string
  heading: string
  text: string
  links: HomepageLink[]
}

export default function Feature(props: FeatureProps) {
  return (
    <Section padding={4} background={Backgrounds.Muted}>
      <Container>
        <Flex gap={4} variant={FlexVariants.Responsive}>
          <Box width={Widths.Half} order={props.flip ? 1 : null}>
            {props.image && (
              <GatsbyImage
                alt={props.image.alt}
                image={getImage(props.image.gatsbyImageData)}
              />
            )}
          </Box>
          <Box width={Widths.Half}>
            <Subhead>
              {props.kicker && <Kicker>{props.kicker}</Kicker>}
              {props.heading}
            </Subhead>
            <Text variant={TextVariants.Lead}>{props.text}</Text>
            <ButtonList links={props.links} />
          </Box>
        </Flex>
      </Container>
    </Section>
  )
}

export const query = graphql`
  fragment HomepageFeatureContent on HomepageFeature {
    id
    kicker
    heading
    text
    links {
      id
      href
      text
    }
    image {
      id
      gatsbyImageData
      alt
    }
  }
`
