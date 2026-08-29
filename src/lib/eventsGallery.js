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
    cover: 'dazzling-designz-event-jewelry-display',
    photos: [
      { basename: 'dazzling-designz-event-jewelry-display', alt: 'Dazzling Designz jewelry on display at an in-person community gathering', caption: 'Handcrafted jewelry on display for guests.' },
      { basename: 'tamara-davis-customer-jewelry-consultation', alt: 'Tamara Davis sharing handcrafted jewelry with an attendee', caption: 'Tamara Davis sharing handcrafted jewelry with attendees.' },
      { basename: 'dazzling-designz-event-community', alt: 'Guests viewing the jewelry displays at a community gathering', caption: 'Guests spending time together at the gathering.' },
      { basename: 'tamara-davis-community-event-portrait', alt: 'Tamara Davis at the Dazzling Designz jewelry display', caption: 'Founder Tamara Davis at the gathering.' },
      { basename: 'dazzling-designz-customer-style', alt: 'Attendee wearing statement jewelry at a community gathering', caption: 'Attendees wearing statement jewelry.' },
      { basename: 'dazzling-designz-event-jewelry-shopping', alt: 'Guests taking a closer look at the jewelry on display', caption: 'Guests taking a closer look at the jewelry.' },
      { basename: 'dazzling-designz-community-portrait-gold-dress', alt: 'A guest in a gold dress at a community gathering', caption: 'Statement jewelry to complete the look.' },
      { basename: 'dazzling-designz-community-guests-tan', alt: 'Guests at the Dazzling Designz booth', caption: 'Guests stopping by the display.' },
      { basename: 'dazzling-designz-community-guests-denim-duo', alt: 'Two guests wearing statement necklaces at a community gathering', caption: 'Guests showing off their statement jewelry.' },
      { basename: 'dazzling-designz-community-guests-denim-pair', alt: 'Guests wearing beaded jewelry at the Dazzling Designz booth', caption: 'Community members connecting over handcrafted pieces.' },
      { basename: 'dazzling-designz-jewelry-table-fitting', alt: 'A guest being helped with a necklace at the Dazzling Designz table', caption: 'Trying on pieces at the display table.' },
      { basename: 'dazzling-designz-jewelry-table-browsing', alt: 'A guest examining beaded necklaces at the Dazzling Designz table', caption: 'Taking a closer look at the beadwork.' },
      { basename: 'dazzling-designz-community-guests-headwrap', alt: 'Two guests posing at the Dazzling Designz jewelry display', caption: 'Sharing style and stories at the display.' },
      { basename: 'dazzling-designz-community-balloon-backdrop', alt: 'A guest at the Dazzling Designz photo backdrop', caption: 'All smiles at the backdrop.' },
      { basename: 'dazzling-designz-jewelry-display-guest', alt: 'A guest viewing jewelry at the Dazzling Designz booth', caption: 'Finding a favorite piece at the display.' },
      { basename: 'dazzling-designz-community-group', alt: 'A group of guests wearing statement jewelry at a community gathering', caption: 'Community, connection, and statement jewelry.' },
      { basename: 'tamara-davis-event-guest', alt: 'Tamara Davis sharing a moment with an attendee', caption: 'Sharing handcrafted jewelry and conversation with attendees.' },
      { basename: 'dazzling-designz-fragrance-thank-you', alt: 'Dazzling Designz thank you card for guests', caption: 'Thank you for your support.' },
    ],
  },
];
