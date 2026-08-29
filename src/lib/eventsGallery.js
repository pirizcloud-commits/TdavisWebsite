// Community & Events content, grouped BY EVENT.
//
// Each event is its own entry and renders as a card on the /events hub; clicking
// a card opens that event's photo album. To add a new event, append another
// object below with its own photos. The page stays organized as a directory of
// events rather than one long wall of pictures.
//
// name comes from the owner's own materials; date and location are optional and
// shown when set (do not invent them). Images are single optimized JPEGs in
// public/images/events, referenced as /images/events/<basename>.jpeg.
export const EVENTS = [
  {
    id: 'fragrance',
    name: 'Fragrance 2026',
    date: 'August 21-22, 2026',
    location: 'Westin Hotel, Raleigh, NC',
    description: 'Handcrafted jewelry on display, guests trying on statement pieces, and Tamara Davis sharing her designs with the community.',
    cover: 'dazzling-designz-guest-orange-suit-fitting',
    photos: [
      { basename: 'dazzling-designz-guest-tan-dress', alt: 'Two guests posing together at the Dazzling Designz jewelry display', caption: 'Guests sharing a moment at the event.' },
      { basename: 'dazzling-designz-guests-denim-outfits', alt: 'Tamara Davis posing with a guest wearing denim and statement jewelry', caption: 'Connecting through handcrafted jewelry and personal style.' },
      { basename: 'dazzling-designz-guest-orange-suit-fitting', alt: 'A guest in an orange suit trying on jewelry at the Dazzling Designz display', caption: 'Trying on handcrafted pieces at the display table.' },
      { basename: 'dazzling-designz-guests-browsing-jewelry', alt: 'Guests examining handcrafted jewelry at the Dazzling Designz display', caption: 'Taking a closer look at the handcrafted collection.' },
      { basename: 'dazzling-designz-guest-denim-overalls', alt: 'Tamara Davis posing with a guest wearing denim overalls and statement jewelry', caption: 'Connecting with community members at the jewelry display.' },
      { basename: 'dazzling-designz-guest-denim-dress', alt: 'Tamara Davis and a guest in a denim dress, both wearing statement jewelry.', caption: 'Guests modeling beautiful handcrafted statement pieces.' },
      { basename: 'dazzling-designz-fragrance-thank-you-flyer', alt: 'Dazzling Designz Thank You flyer for the Fragrance 2026 event.', caption: 'Thank you for making Fragrance 2026 a success!' },
      { basename: 'dazzling-designz-guest-gold-pleated-dress', alt: 'Guest wearing a gold pleated dress and long beaded necklace.', caption: 'A statement piece completing an elegant look.' },
      { basename: 'dazzling-designz-guests-balloon-backdrop', alt: 'Two guests posing in front of a gold balloon and greenery backdrop.', caption: 'Smiling for a photo at the Dazzling Designz backdrop.' },
      { basename: 'dazzling-designz-guest-blue-patterned-dress', alt: 'Tamara Davis with a guest in a long blue patterned dress.', caption: 'Showcasing beautiful custom beadwork.' },
      { basename: 'dazzling-designz-guest-dark-pleated-outfit', alt: 'Tamara Davis posing with a guest in a dark pleated outfit.', caption: 'Enjoying the Fragrance 2026 event.' },
    ],
  },
];
