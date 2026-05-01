const { writeData, generateId } = require('./db');

const animeData = [
  {
    title: 'Jujutsu Kaisen',
    titleEnglish: 'Jujutsu Kaisen',
    titleJapanese: '呪術廻戦',
    slug: 'jujutsu-kaisen',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj5YG0CGo.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-YuCa4yobjl1T.jpg',
    description:
      'Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life. One day, to save a classmate who has been attacked by curses, he eats the finger of Ryomen Sukuna, taking the curse into his own soul. From then on, he shares one body with Ryomen Sukuna.',
    genres: ['Action', 'Supernatural', 'Horror', 'Shounen'],
    status: 'Ongoing',
    rating: 8.7,
    totalEpisodes: 47,
    currentEpisode: 47,
    isPopular: true,
    isLatest: true,
    season: 'Fall',
    year: 2020,
    studio: 'MAPPA',
    type: 'TV',
    createdAt: new Date().toISOString()
  },
  {
    title: 'Chainsaw Man',
    titleEnglish: 'Chainsaw Man',
    titleJapanese: 'チェンソーマン',
    slug: 'chainsaw-man',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-FlochcFsyoF.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-gz0Nn2SzKIaE.jpg',
    description:
      'Denji has a simple dream—to live a happy and peaceful life, spending time with a girl he likes. This is a far cry from reality, however, as Denji is forced by the yakuza into killing devils in order to pay off his deceased father\'s debt.',
    genres: ['Action', 'Gore', 'Supernatural', 'Shounen'],
    status: 'Ongoing',
    rating: 8.5,
    totalEpisodes: 12,
    currentEpisode: 12,
    isPopular: true,
    isLatest: false,
    season: 'Fall',
    year: 2022,
    studio: 'MAPPA',
    type: 'TV',
    createdAt: new Date(Date.now() - 100000).toISOString()
  },
  {
    title: 'Demon Slayer',
    titleEnglish: 'Demon Slayer: Kimetsu no Yaiba',
    titleJapanese: '鬼滅の刃',
    slug: 'demon-slayer',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-yvBqe4Gu8oBc.jpg',
    description:
      'It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko, the sole survivor, has been transformed into a demon herself.',
    genres: ['Action', 'Fantasy', 'Historical', 'Shounen'],
    status: 'Completed',
    rating: 8.9,
    totalEpisodes: 44,
    currentEpisode: 44,
    isPopular: true,
    isLatest: false,
    season: 'Spring',
    year: 2019,
    studio: 'ufotable',
    type: 'TV',
    createdAt: new Date(Date.now() - 200000).toISOString()
  },
  {
    title: 'Attack on Titan',
    titleEnglish: 'Attack on Titan',
    titleJapanese: '進撃の巨人',
    slug: 'attack-on-titan',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C3H9Q3nx3xyG.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg',
    description:
      'Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans, forcing humans to hide in fear behind enormous concentric walls. Eren Yeager, after seeing his mother being devoured by a Titan, vows to kill every single Titan and reclaim the world for mankind.',
    genres: ['Action', 'Drama', 'Fantasy', 'Mystery'],
    status: 'Completed',
    rating: 9.1,
    totalEpisodes: 87,
    currentEpisode: 87,
    isPopular: true,
    isLatest: false,
    season: 'Spring',
    year: 2013,
    studio: 'MAPPA',
    type: 'TV',
    createdAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    title: 'Spy x Family',
    titleEnglish: 'Spy x Family',
    titleJapanese: 'スパイファミリー',
    slug: 'spy-x-family',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-SgDHkZBn4Trv.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-l0bOGsnuOeH1.jpg',
    description:
      'Agent Twilight is the best spy in Westalis. His newest mission requires him to start a family, which means adopting a child and getting a wife. His adopted daughter, Anya, happens to be a telepath, and his new wife, Yor, is an assassin.',
    genres: ['Action', 'Comedy', 'Slice of Life', 'Shounen'],
    status: 'Ongoing',
    rating: 8.6,
    totalEpisodes: 25,
    currentEpisode: 25,
    isPopular: true,
    isLatest: true,
    season: 'Spring',
    year: 2022,
    studio: 'WIT Studio',
    type: 'TV',
    createdAt: new Date().toISOString()
  },
  {
    title: 'One Piece',
    titleEnglish: 'One Piece',
    titleJapanese: 'ワンピース',
    slug: 'one-piece',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YrQcross-fmn.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-T4PJYSFgP42z.jpg',
    description:
      'Gol D. Roger, a man referred to as the "Pirate King," is set to be executed by the World Government. But just before his demise, he confirms the existence of a great treasure, One Piece, located somewhere within the vast ocean known as the Grand Line.',
    genres: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Shounen'],
    status: 'Ongoing',
    rating: 8.8,
    totalEpisodes: 1100,
    currentEpisode: 1100,
    isPopular: true,
    isLatest: true,
    season: 'Fall',
    year: 1999,
    studio: 'Toei Animation',
    type: 'TV',
    createdAt: new Date().toISOString()
  },
  {
    title: 'Vinland Saga',
    titleEnglish: 'Vinland Saga',
    titleJapanese: 'ヴィンランド・サガ',
    slug: 'vinland-saga',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-1Zi0EcWIMVOm.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101348-GkYxlGH08k44.jpg',
    description:
      'As a child, Thorfinn sat at the feet of the great Leif Ericson and was raised on tales of a land far to the west, but his youthful fantasies were shattered by a mercenary raid. Raised by the Vikings who murdered his father, he became a mercenary himself.',
    genres: ['Action', 'Adventure', 'Drama', 'Historical'],
    status: 'Completed',
    rating: 8.8,
    totalEpisodes: 48,
    currentEpisode: 48,
    isPopular: false,
    isLatest: false,
    season: 'Summer',
    year: 2019,
    studio: 'MAPPA',
    type: 'TV',
    createdAt: new Date(Date.now() - 400000).toISOString()
  },
  {
    title: 'Mushoku Tensei',
    titleEnglish: 'Mushoku Tensei: Jobless Reincarnation',
    titleJapanese: '無職転生',
    slug: 'mushoku-tensei',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-lToFZkFmqPfh.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/108465-3dSLDXBPWmxM.jpg',
    description:
      'A 34-year-old underachiever gets another chance at life when he\'s reborn in a new world as Rudeus Greyrat. He vows to live his life without regrets in this new world with magic.',
    genres: ['Drama', 'Ecchi', 'Fantasy', 'Slice of Life'],
    status: 'Completed',
    rating: 8.3,
    totalEpisodes: 23,
    currentEpisode: 23,
    isPopular: false,
    isLatest: false,
    season: 'Winter',
    year: 2021,
    studio: 'Studio Bind',
    type: 'TV',
    createdAt: new Date(Date.now() - 500000).toISOString()
  },
];

const generateEpisodes = (animeId, count = 12) => {
  return Array.from({ length: count }, (_, i) => ({
    _id: generateId(),
    animeId,
    episodeNumber: i + 1,
    title: `Episode ${i + 1}`,
    thumbnail: `https://picsum.photos/seed/${animeId}${i}/400/225`,
    duration: 1440,
    airDate: new Date(Date.now() - (count - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
    isFiller: false,
    servers: [
      {
        name: 'Server 1 (Embed)',
        type: 'iframe',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        quality: '720p',
        isDefault: true,
      },
      {
        name: 'Server 2 (HLS)',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        quality: '1080p',
        isDefault: false,
      },
      {
        name: 'Server 3 (HLS Backup)',
        type: 'hls',
        url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8',
        quality: '720p',
        isDefault: false,
      },
    ],
  }));
};

const seed = () => {
  try {
    console.log('🌱 Starting seed to JSON file...');
    
    // Add IDs to anime
    const animes = animeData.map(a => ({ ...a, _id: generateId() }));
    console.log(`✅ Generated ${animes.length} anime`);

    // Generate episodes
    const episodes = animes.flatMap((anime) =>
      generateEpisodes(anime._id, Math.min(12, anime.currentEpisode || 12))
    );
    console.log(`✅ Generated ${episodes.length} episodes`);

    // Write to file
    const success = writeData({ anime: animes, episodes });
    
    if (success) {
      console.log('\n🎉 JSON Database seeded successfully!');
      console.log('🚀 Run: npm run dev to start the server');
      process.exit(0);
    } else {
      throw new Error("Failed writing to JSON");
    }
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
