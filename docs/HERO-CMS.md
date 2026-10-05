# Public Page Hero CMS

Hero controls are available in **Admin → Site Pages → [Page] → hero** for the registered public pages.

Supported controls:
- Enable / disable hero
- Eyebrow text
- Heading and accent text
- Description
- Desktop hero image
- Optional mobile hero image (falls back to desktop image)
- Accessible image alt text
- Desktop and mobile image focal position
- Overlay strength (0–80)
- Primary CTA label + URL
- Secondary CTA label + URL

Pages wired to these controls:
- Home
- Blog / Latest
- WordPress
- Development
- How-To
- Online Business
- AI Tools
- Reviews
- Comparisons
- About
- Contact
- Resources

Hero media is selected from the existing Media Library. No schema migration is required; mobile media and presentation settings are stored in the section JSON config while the desktop image continues to use the existing `imageId` field.
