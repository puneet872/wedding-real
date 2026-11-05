/* ============================================================================
   WEDDING CONFIG — Ashish & Sapna (groom's side)
   ----------------------------------------------------------------------------
   Made from the WI wedding template. Every piece of text is { en, hi };
   the site opens in Hindi and guests can switch to English in the menu.
   ============================================================================ */
window.WEDDING = {

  defaultLang: 'hi',

  theme: {
    night: '#141B3F', paper: '#F6EEE0', primary: '#B8281A', gold: '#C9973A', ink: '#21140F',
    glass: true                          // dark see-through glass over the venue photo
  },

  // Sections on this site: no travel page and no RSVP form (guests can call or WhatsApp instead)
  sections: { couple: true, events: true, vows: true, family: true, travel: false, rsvp: false },

  couple: {
    bride: {
      first: { en: 'Sapna', hi: 'सपना' },
      full: { en: 'Sapna Gond', hi: 'सपना गोंड़' },
      honorific: { en: '', hi: 'आयु० कु०' },
      parents: { en: 'Daughter of Shri Ratanlal Gond & Late Smt. Guddi Gond', hi: 'सुपुत्री श्री रतनलाल गोंड़ एवं स्व० गुड्डी गोंड़' },
      about: { en: 'Darikha Sheikh Ahmadpur, P.O. Sanjarpur, Azamgarh', hi: 'ग्राम दरिखा शेख अहमदपुर, पोस्ट संजरपुर, आजमगढ़' },
      look: { skin: 'mid', lehenga: '#B3172C', dupatta: '#D62E4C' },
      photo: ''
    },
    groom: {
      first: { en: 'Ashish', hi: 'आशीष' },
      full: { en: 'Ashish Gond', hi: 'आशीष गोंड़' },
      honorific: { en: '', hi: 'चि०' },
      parents: { en: 'Son of Shri Indrajeet Gond & Smt. Rajkumari Gond', hi: 'सुपुत्र श्री इन्द्रजीत गोंड़ एवं श्रीमती राजकुमारी गोंड़' },
      about: { en: 'Bairidih, P.O. Lalganj, Azamgarh', hi: 'ग्राम बैरीडीह, पोस्ट लालगंज, आजमगढ़' },
      look: { skin: 'wheat', sherwani: '#EFDDB4', safa: '#D9356A' },
      photo: ''
    },
    first: 'groom',                      // groom's-side invitation: Ashish's name comes first
    joiner: { en: '&', hi: 'संग' },
    monogram: { en: 'A · S', hi: 'आ · स' },
    monogramImage: 'art/monogram.webp'
  },

  wedding: {
    dateLabel: { en: 'Monday, 30 November 2026', hi: 'सोमवार, 30 नवम्बर 2026' },
    place: { en: 'Bairidih, Lalganj, Azamgarh', hi: 'बैरीडीह, लालगंज, आजमगढ़' },
    muhurat: '2026-11-30T16:00:00+05:30',            // the countdown runs to the baraat setting off
    muhuratLabel: { en: '4:00 PM, Monday 30 November 2026', hi: 'सायं 4:00 बजे, सोमवार 30 नवम्बर 2026' },
    untilLabel: { en: 'until the baraat sets off', hi: 'बारात प्रस्थान में शेष' }
  },

  invocation: { en: '॥ Shri Ganeshaya Namah ॥', hi: '॥ श्री गणेशाय नमः ॥' },

  shloka: {
    text: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभः ।<br>निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥'
  },

  // The card's own words (groom's side)
  invitation: [
    { style: 'line', text: { en: 'Dear family and friends,', hi: 'स्नेही स्वजन,' } },
    { style: 'line', text: { en: 'by the boundless grace of the Almighty, our son', hi: 'परमपिता परमेश्वर की असीम अनुकम्पा से मेरे सुपुत्र' } },
    { style: 'name', who: 'groom', full: true },
    { style: 'small', text: { en: 'son of Shri Indrajeet Gond & Smt. Rajkumari Gond, Bairidih, P.O. Lalganj, Azamgarh', hi: 'सुपुत्र: श्री इन्द्रजीत गोंड़ एवं श्रीमती राजकुमारी गोंड़, ग्राम: बैरीडीह, पोस्ट: लालगंज, जनपद: आजमगढ़' } },
    { style: 'line', text: { en: 'weds', hi: 'परिणय' } },
    { style: 'name', who: 'bride', full: true },
    { style: 'small', text: { en: 'daughter of Shri Ratanlal Gond & Late Smt. Guddi Gond, Darikha Sheikh Ahmadpur, P.O. Sanjarpur, Azamgarh', hi: 'सुपुत्री: श्री रतनलाल गोंड़ एवं स्व० गुड्डी गोंड़, ग्राम: दरिखा शेख अहमदपुर, पोस्ट: संजरपुर, जनपद: आजमगढ़' } },
    { style: 'line', text: { en: 'You are warmly invited to the joyous Tilak ceremony and the Baraat. Kindly grace us with your presence.', hi: 'के ॥ तिलकोत्सव ॥ एवं ॥ बारात ॥ की मांगलिक एवं हर्षोल्लास की पावन बेला पर आप सादर आमंत्रित हैं, कृपया पधार कर हमें अनुग्रहीत करें।' } }
  ],

  kidNote: {
    text: { en: 'Haldi and chandan, the bond of family — you’re so welcome at my mama’s wedding!', hi: 'हल्दी है चन्दन है, रिश्तों का बन्धन है। मेरे मामा की शादी में आपका अभिनन्दन है।' },
    sign: { en: '— Aditya & Aditi', hi: '— आदित्य, आदिति' }
  },

  events: [
    {
      id: 'tilak', scene: 'reception', image: 'art/groom-greet.webp',
      color: '#B8281A', ink: '#FBF3E4', accent: '#FFD36B',
      name: { en: 'Tilak & Feast', hi: 'तिलकोत्सव एवं प्रीतिभोज' },
      day: { en: 'Thursday, 26 November', hi: 'गुरुवार, 26 नवम्बर' },
      time: { en: 'Evening', hi: 'सायं' },
      start: '2026-11-26T18:00:00+05:30', end: '2026-11-26T23:00:00+05:30',
      venue: { en: 'Our home, Bairidih, P.O. Lalganj, Azamgarh', hi: 'निज निवास, ग्राम बैरीडीह, पो० लालगंज, आजमगढ़' },
      map: 'https://www.google.com/maps/search/?api=1&query=Bairidih+Lalganj+Azamgarh',
      about: { en: 'The tilak ceremony, followed by a feast at our home.', hi: 'शुभ तिलकोत्सव, एवं निज निवास पर प्रीतिभोज।' }
    },
    {
      id: 'baraat', scene: 'baraat',
      color: '#9E1F14', ink: '#FBF3E4', accent: '#FFD36B',
      name: { en: 'Baraat', hi: 'बारात' },
      day: { en: 'Monday, 30 November', hi: 'सोमवार, 30 नवम्बर' },
      time: { en: 'Sets off at 4:00 PM', hi: 'सायं 4:00 बजे प्रस्थान' },
      start: '2026-11-30T16:00:00+05:30', end: '2026-11-30T23:59:00+05:30',
      venue: { en: 'From our home in Bairidih to Heritage Marriage Hall, Sanjarpur, Sarai Mir, Azamgarh', hi: 'निज निवास, बैरीडीह से ‘हेरिटेज मैरेज हॉल’, संजरपुर, सरायमीर, आजमगढ़' },
      map: 'https://maps.app.goo.gl/fid8exWGxvKCJcPQ6', // Heritage Marriage Hall
      about: { en: 'The baraat leaves our home for the wedding at Heritage Marriage Hall.', hi: 'बारात हमारे निज निवास से विवाह स्थल ‘हेरिटेज मैरेज हॉल’ के लिए प्रस्थान करेगी।' }
    }
  ],

  // The seven steps (Hindu ceremonies). Set vows: null to hide the section.
  vows: {
    after: 'baraat',                                 // shown right after this event (the wedding), before the reception
    title: { en: 'Seven steps around the fire', hi: 'सात फेरे' },
    intro: { en: 'Seven rounds of the sacred fire, seven promises. Tap a step to read it.', hi: 'पवित्र अग्नि के सात फेरे, सात वचन। हर वचन पढ़ने के लिए उसे छुएँ।' },
    source: { en: 'Text: Pāraskara Gṛhyasūtra 1.8.1. Literal glosses after H. Oldenberg (1886); the second line under each is ours.', hi: 'मूल पाठ: पारस्कर गृह्यसूत्र १.८.१। शाब्दिक अर्थ ओल्डनबर्ग (१८८६) के अनुवाद पर आधारित; दूसरी पंक्ति हमारी।' },
    steps: [
      { sa: 'एकमिषे', tr: 'ekam iṣe', lit: { en: '“One step, for sap” — for nourishment.', hi: 'पहला पग — अन्न और पोषण के लिए।' }, ours: { en: 'That neither of us ever goes hungry — for food, or for attention.', hi: 'कि हम दोनों कभी भूखे न रहें — न अन्न के, न एक-दूसरे के ध्यान के।' } },
      { sa: 'द्वे ऊर्जे', tr: 'dve ūrje', lit: { en: '“Two, for juice” — for vigour and strength.', hi: 'दूसरा पग — बल और ऊर्जा के लिए।' }, ours: { en: 'Strength of body and of nerve, for the long days and the longer nights.', hi: 'तन और मन की ताक़त — लंबे दिनों और उससे भी लंबी रातों के लिए।' } },
      { sa: 'त्रीणि रायस्पोषाय', tr: 'trīṇi rāyas-poṣāya', lit: { en: '“Three, for the prospering of wealth.”', hi: 'तीसरा पग — धन-धान्य की वृद्धि के लिए।' }, ours: { en: 'Earned honestly, shared freely, and never the most interesting thing about us.', hi: 'ईमानदारी से कमाया, खुले दिल से बाँटा — और कभी हमारी सबसे बड़ी पहचान न बने।' } },
      { sa: 'चत्वारि मायोभवाय', tr: 'catvāri māyo-bhavāya', lit: { en: '“Four, for comfort.”', hi: 'चौथा पग — सुख और आनंद के लिए।' }, ours: { en: 'Joy kept on purpose — chai on the terrace, old songs, the good kind of silence.', hi: 'जान-बूझकर सँजोई ख़ुशियाँ — छत पर चाय, पुराने गाने, और सुकून भरी चुप्पी।' } },
      { sa: 'पञ्च पशुभ्यः', tr: 'pañca paśubhyaḥ', lit: { en: '“Five, for cattle.”', hi: 'पाँचवाँ पग — पशुधन के लिए।' }, ours: { en: 'Once a household’s wealth. We read it as every life in our care — family, friends, and one spoilt dog.', hi: 'कभी घर की असली दौलत। हमारे लिए — हर वो जीव जिसकी देखभाल हमारे ज़िम्मे है: परिवार, दोस्त, और एक लाडला कुत्ता।' } },
      { sa: 'षड् ऋतुभ्यः', tr: 'ṣaḍ ṛtubhyaḥ', lit: { en: '“Six, for the seasons.”', hi: 'छठा पग — छहों ऋतुओं के लिए।' }, ours: { en: 'Every season, together: the monsoons and the dry Mays, the Diwalis and the hospital waiting rooms.', hi: 'हर मौसम साथ में — सावन और जेठ, दिवाली और अस्पताल के इंतज़ार वाले कमरे भी।' } },
      { sa: 'सखे सप्तपदा भव', tr: 'sakhe saptapadā bhava', lit: { en: '“Friend, be with seven steps.”', hi: 'सातवाँ पग — हे सखा, सात पगों से मेरे बनो।' }, ours: { en: 'The last step isn’t for wealth or strength. It’s for friendship. The ancients got that exactly right.', hi: 'आख़िरी पग धन या बल के लिए नहीं — दोस्ती के लिए है। हमारे पूर्वज बिल्कुल सही थे।' } }
    ]
  },

  families: {
    bride: {                                         // left: the hosts
      title: { en: 'With warm regards', hi: 'विनीत' },
      place: { en: 'Gond family, Bairidih', hi: 'गोंड़ परिवार, बैरीडीह' },
      names: [
        { en: 'Jagdish Gond', hi: 'जगदीश गोंड़' },
        { en: 'Late Sabhajit Gond', hi: 'स्व० सभाजीत गोंड़' },
        { en: 'Indrajeet Gond', hi: 'इन्द्रजीत गोंड़' },
        { en: 'Dharmjeet Gond', hi: 'धर्मजीत गोंड़' },
        { en: 'Vijaybahadur Gond', hi: 'विजयबहादुर गोंड़' },
        { en: 'Prakash Gond', hi: 'प्रकाश गोंड़' },
        { en: 'Vijay Gond', hi: 'विजय गोंड़' }
      ]
    },
    groom: {                                         // right: those eager to see you
      title: { en: 'Eager to see you', hi: 'दर्शनाभिलाषी' },
      names: [
        { en: 'Dinesh Gond', hi: 'दिनेश गोंड़' },
        { en: 'Deepak Gond', hi: 'दीपक गोंड़' },
        { en: 'Pradeep Gond', hi: 'प्रदीप गोंड़' },
        { en: 'Ashok Gond', hi: 'अशोक गोंड़' },
        { en: 'Rahul Gond', hi: 'राहुल गोंड़' },
        { en: 'Rohit Gond', hi: 'रोहित गोंड़' },
        { en: 'Anand Gond', hi: 'आनन्द गोंड़' },
        { en: 'Aman Gond', hi: 'अमन गोंड़' },
        { en: 'Karan Gond', hi: 'करन गोंड़' },
        { en: 'Golu Gond', hi: 'गोलू गोंड़' },
        { en: 'Shani Gond', hi: 'शनि गोंड़' },
        { en: 'Manish', hi: 'मनीष' },
        { en: 'Anshu', hi: 'अंशु' },
        { en: 'Ankit', hi: 'अंकित' },
        { en: 'Krishna', hi: 'कृष्णा' },
        { en: 'Aaron', hi: 'आरोन' },
        { en: 'Ayush', hi: 'आयुष' },
        { en: 'Anurag', hi: 'अनुराग' }
      ],
      after: { en: 'and the whole Gond family & friends', hi: 'एवं समस्त गोंड़ परिवार व मित्रगण' }
    }
  },

  contacts: [],
  rsvp: { whatsapp: '919580895907', to: { en: 'the Gond family', hi: 'गोंड़ परिवार' }, deadline: '' },
  contact: { phone: '919580895907', show: '95808 95907' },

  shagun: { en: 'Kindly grace us with your presence.', hi: 'कृपया पधार कर हमें अनुग्रहीत करें।' },
  hashtag: '',
  hosts: { en: 'Jagdish Gond, Indrajeet Gond', hi: 'जगदीश गोंड़, इन्द्रजीत गोंड़' },

  /* ---------------- paper-craft artwork (optional) ----------------
     The site draws every character itself. To make them look like a handmade
     paper diorama instead, add images (PNG or WebP with a transparent
     background) to an art/ folder and list them here. Any slot left '' keeps
     the built-in drawing. docs/ART-GUIDE.md has the prompts to make them.  */
  art: {
    bride: 'art/bride.webp', groom: 'art/groom.webp',       // standing, facing you (couple section)
    brideGreet: 'art/bride-greet.webp', groomGreet: 'art/groom-greet.webp', // shown when a guest taps them
    coupleVarmala: 'art/couple-varmala.webp',               // the hero, under the mandap
    coupleNamaste: 'art/couple-namaste.webp',               // the reception
    haldiBride: '', haldiHand: '', // the bride on her chowki; a hand reaching in from the left
    haldiCheeks: [[.455, .225], [.615, .215]],              // where the turmeric lands, as fractions of the haldi image
    haldiReach: 62,                                         // the angle the hands come in at (0 = from the sides, 90 = from above)
    mehendiHand: '', mehendiHandPlain: '', // the same hand with and without mehendi
    mehendiCone: '', mehendiConeTurn: 0, // the artist's hand and cone (tip at its bottom-left corner); turn it by degrees if wanted
    mehendiName: { x: .705, y: .335, rotate: -62, size: .05 }, // where the groom's name hides on the hand
    mehendiZone: [0, .01, 1, .69],                          // the part of the image the cone colours in (x0, y0, x1, y1)
    sangeetBride: ['art/sangeet-bride-1.webp', 'art/sangeet-bride-2.webp'], // two dance poses each; they swap on the dhol beats
    sangeetGroom: ['art/sangeet-groom-1.webp', 'art/sangeet-groom-2.webp'],
    baraatGroom: 'art/baraat-groom.webp', baraatDholi: 'art/baraat-dholi.webp', baraatDancers: ['art/baraat-dancer-1.webp', 'art/baraat-dancer-2.webp'],
    baraatSangeetDancers: true                              // the sangeet dancers walk in the baraat too
  },

  /* ---------------- the hero photo (optional) ----------------
     The first screen after the gate. With a photo, it carries on from the
     door clip: the same courtyard, with the names and the couple on it.
     photo is portrait (phones), photoWide is landscape (laptops).
     Leave both '' for the drawn night-time mandap.  */
  hero: { photo: 'art/hero-venue.jpg', photoWide: 'art/hero-venue-wide.jpg' },

  /* ---------------- the opening door (optional) ----------------
     A realistic door instead of the drawn gate: a still of the closed door and
     a short clip of it opening onto the venue (made in Google Flow, see
     docs/ART-GUIDE.md). Leave video and poster '' to keep the drawn gate.
     A clip can be one file or a list, e.g. ['art/gate-door.webm', 'art/gate-door.mp4'];
     the browser plays the first one it can.  */
  gate: {
    video: ['art/gate-door.mp4', 'art/gate-door.webm'], poster: 'art/gate-door.jpg',                // portrait (9:16), for phones
    videoWide: ['art/gate-door-wide.mp4', 'art/gate-door-wide.webm'], posterWide: 'art/gate-door-wide.jpg', // landscape (16:9), for laptops; optional
    revealAt: 0,                         // second at which the invitation appears (0 = when the clip ends)
    videoSound: false                    // also play the clip's own sound (door creak, birds) under the dhol
  },

  music: '',

  /* ---------------- interface words (rarely need changing) ---------------- */
  ui: {
    nav: {
      invite: { en: 'Invitation', hi: 'निमंत्रण' }, couple: { en: 'Couple', hi: 'वर-वधू' },
      events: { en: 'Ceremonies', hi: 'कार्यक्रम' }, family: { en: 'Family', hi: 'परिवार' }, travel: { en: 'Travel', hi: 'ठिकाना' }, rsvp: { en: 'RSVP', hi: 'पधारें' }
    },
    gateTitle: { en: 'You are invited', hi: 'आप सादर आमंत्रित हैं' },
    gateOpen: { en: 'Open the invitation', hi: 'निमंत्रण खोलें' },
    skip: { en: 'Skip', hi: 'आगे बढ़ें' },
    gateHint: { en: 'Best with sound on', hi: 'आवाज़ के साथ देखें' },
    shubhVivah: { en: 'Shubh Vivah', hi: 'शुभ विवाह' },
    gettingMarried: { en: 'are getting married', hi: 'परिणय सूत्र में बँध रहे हैं' },
    scroll: { en: 'Scroll', hi: 'नीचे देखें' },
    sec: {
      invite: { en: 'With love, an invitation', hi: 'स्नेह निमंत्रण' },
      couple: { en: 'The bride & the groom', hi: 'वधू एवं वर' },
      events: { en: 'The ceremonies', hi: 'मांगलिक कार्यक्रम' },
      eventsIntro: { en: 'Five celebrations, each in its own colour. Wear it, and you’ll match the photographs for the rest of your life.', hi: 'पाँच रस्में, हर एक का अपना रंग। वही पहनिए — तस्वीरें हमेशा के लिए खिल उठेंगी।' },
      family: { en: 'With love', hi: 'आपके अपने' },
      travel: { en: 'Getting there', hi: 'कैसे पहुँचें' },
      rsvp: { en: 'You’re coming, right?', hi: 'पधारेंगे ना?' }
    },
    bride: { en: 'The bride', hi: 'वधू' }, groom: { en: 'The groom', hi: 'वर' },
    greet: { en: 'Tap to say hello', hi: 'नमस्ते कहने के लिए छुएँ' },
    when: { en: 'When', hi: 'कब' }, where: { en: 'Where', hi: 'कहाँ' }, wear: { en: 'What to wear', hi: 'पहनावा' },
    addCal: { en: 'Add to calendar', hi: 'कैलेंडर में जोड़ें' }, allCal: { en: 'Add all to calendar', hi: 'सभी कैलेंडर में जोड़ें' },
    map: { en: 'Map', hi: 'नक़्शा' }, day: { en: 'Day', hi: 'दिन' },
    playDhol: { en: 'Play the dhol', hi: 'ढोल बजाइए' }, stopDhol: { en: 'Stop', hi: 'रोकें' },
    tapDhol: { en: 'Or tap the dhol yourself', hi: 'या ख़ुद ढोल पर थाप दें' },
    findName: { en: 'Find the name!', hi: 'नाम ढूँढो!' },
    findNameText: { en: 'The groom’s name is hidden in her mehendi. Tap where you think it is.', hi: 'दुल्हन की मेहंदी में दूल्हे का नाम छिपा है। जहाँ लगे, वहाँ छुएँ।' },
    findTap: { en: '', hi: '' },
    findGiveUp: { en: 'I give up — show me', hi: 'हार मान ली — दिखाइए' },
    found: { en: 'Found it! The groom is going to be so annoyed.', hi: 'मिल गया! दूल्हे राजा तो चिढ़ जाएँगे।' },
    revealed: { en: 'There — tucked inside a paisley. Don’t tell him.', hi: 'ये रहा — कैरी के अंदर छुपा। उन्हें मत बताना।' },
    warm: { en: 'Warm — very close!', hi: 'गरम! बहुत पास।' }, cold: { en: 'Cold. Keep looking.', hi: 'ठंडा। और ढूँढिए।' },
    hint: { en: 'Hint: artists hide names inside a paisley.', hi: 'इशारा: नाम अक्सर कैरी के अंदर छुपाते हैं।' },
    step: { en: 'Step', hi: 'फेरा' }, of: { en: 'of', hi: 'में से' },
    next: { en: 'Next step', hi: 'अगला फेरा' }, prev: { en: 'Previous', hi: 'पिछला' }, again: { en: 'Walk again', hi: 'फिर से' },
    ordinals: { en: ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh'], hi: ['पहला', 'दूसरा', 'तीसरा', 'चौथा', 'पाँचवाँ', 'छठा', 'सातवाँ'] },
    stay: { en: 'Stay', hi: 'ठहरना' }, weather: { en: 'Weather', hi: 'मौसम' }, ask: { en: 'Who to ask', hi: 'किससे पूछें' },
    byDay: { en: 'by day', hi: 'दिन में' }, byNight: { en: 'at night', hi: 'रात में' }, openMap: { en: 'Open in Maps', hi: 'नक़्शे में देखें' },
    rsvpYes: { en: 'Yes, wouldn’t miss it', hi: 'हाँ, ज़रूर आएँगे' }, rsvpNo: { en: 'With you in spirit', hi: 'दिल से साथ हैं' },
    name: { en: 'Your name', hi: 'आपका नाम' }, phone: { en: 'WhatsApp number', hi: 'व्हाट्सऐप नंबर' },
    howMany: { en: 'How many of you?', hi: 'कितने लोग?' }, which: { en: 'Which celebrations?', hi: 'किन रस्मों में?' },
    food: { en: 'Food', hi: 'भोजन' }, veg: { en: 'Veg', hi: 'शाकाहारी' }, jain: { en: 'Jain', hi: 'जैन' }, nonveg: { en: 'Non-veg', hi: 'मांसाहारी' },
    travelBy: { en: 'Arriving by', hi: 'कैसे आएँगे' }, arrival: { en: 'Arrival date', hi: 'पहुँचने की तारीख़' },
    modes: { en: ['Flight', 'Train', 'Road', 'Already in town'], hi: ['हवाई जहाज़', 'रेल', 'सड़क', 'शहर में ही हैं'] },
    note: { en: 'A blessing, a song request, or a warning', hi: 'आशीर्वाद, गाने की फ़रमाइश, या कोई चेतावनी' },
    notePh: { en: 'Kabir, she is always right. — Mausaji', hi: 'कबीर, वो हमेशा सही होती है। — मौसाजी' },
    namePh: { en: 'As your Dadi would say it', hi: 'जैसे दादी पुकारती हैं' },
    send: { en: 'Send on WhatsApp', hi: 'व्हाट्सऐप पर भेजें' },
    sendHint: { en: 'This opens WhatsApp with your reply already written — just press send.', hi: 'व्हाट्सऐप खुलेगा, जवाब पहले से लिखा होगा — बस भेज दीजिए।' },
    nameMissing: { en: 'Please tell us your name.', hi: 'कृपया अपना नाम लिखें।' },
    thanks: { en: 'Thank you!', hi: 'धन्यवाद!' },
    thanksYes: { en: 'your reply is on its way. See you there!', hi: 'आपका जवाब पहुँच रहा है। जल्द मिलते हैं!' },
    thanksNo: { en: 'we’ll miss you — and save you some mithai.', hi: 'आपकी कमी खलेगी — मिठाई आपके लिए बचा कर रखेंगे।' },
    waFallback: { en: 'WhatsApp didn’t open? Tap here.', hi: 'व्हाट्सऐप नहीं खुला? यहाँ टैप करें।' },
    edit: { en: 'Edit my reply', hi: 'जवाब बदलें' },
    days: { en: 'days', hi: 'दिन' }, hours: { en: 'hours', hi: 'घंटे' }, minutes: { en: 'minutes', hi: 'मिनट' }, seconds: { en: 'seconds', hi: 'पल' },
    until: { en: 'until the muhurat', hi: 'शुभ मुहूर्त में शेष' },
    contactLabel: { en: 'To reach us', hi: 'सम्पर्क सूत्र' },
    married: { en: 'They’re married! Thank you for every blessing.', hi: 'शुभ विवाह सम्पन्न। आपके आशीर्वाद के लिए धन्यवाद।' },
    welcome: { en: 'With regards', hi: 'विनीत' },
    sound: { en: 'Sound', hi: 'आवाज़' }, menu: { en: 'Menu', hi: 'मेनू' }, language: { en: 'Language', hi: 'भाषा' },
    waMsg: {
      hello: { en: 'Namaste! RSVP for the wedding', hi: 'नमस्ते! शादी के लिए जवाब' },
      name: { en: 'Name', hi: 'नाम' }, phone: { en: 'Phone', hi: 'फ़ोन' },
      coming: { en: 'Coming', hi: 'आ रहे हैं' }, yes: { en: 'Yes!', hi: 'हाँ!' }, people: { en: 'of us', hi: 'लोग' },
      no: { en: 'Can’t make it — with you in spirit', hi: 'नहीं आ पाएँगे — दिल से साथ हैं' },
      events: { en: 'Celebrations', hi: 'रस्में' }, food: { en: 'Food', hi: 'भोजन' }, travel: { en: 'Arriving by', hi: 'आगमन' }, note: { en: 'Message', hi: 'संदेश' }
    }
  }
};
