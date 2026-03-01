export interface StaticArtist {
  slug: string;
  name: string;
  genre: string;
  bpm: string;
  location: string;
  rate: string;
  imageUrl: string;
  bio: string;
  nextAvailable: string;
}

export const staticArtists: StaticArtist[] = [
  {
    slug: 'dj-axon',
    name: 'DJ Axon',
    genre: 'Techno',
    bpm: '132',
    location: 'Berlin, DE',
    rate: '₹5000',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHuwi1OBEG19lfsbI5Jww52LdyDiuRBk8fKyXHW12NjgGh211Vsnnz1RzWOU0f0lgj3s0R_F6GQCRVsvJnzZ2WOADQ0xQtI-nGaSJa7ainqmEjWOrsyfGN2YubxK0NYnMiCexrAuCOzOuq-lxcQobBL7BxOjKuXSx284_lNFudA_VBMotevMgo0mqRybbdjLO0cElp05z_-rbUGxGoaRSYq_sqCU6AFtf_m7Yj2S5lfvGXd-cPJEaIt_fPpHCjf5P_kIZ9EAMihMc',
    bio: 'Emerging from the concrete depths of Berlin\'s industrial sector, DJ Axon has become synonymous with a sound that is both surgically precise and deeply emotional. His sets are architectural constructions, building layer upon layer of rhythmic tension until the release is inevitable. With a background in sound engineering, he approaches each performance as a technical challenge, pushing the venue\'s sound system to its absolute limits.',
    nextAvailable: 'Oct 14, 2023',
  },
  {
    slug: 'vera-lo',
    name: 'Vera Ló',
    genre: 'Deep House',
    bpm: '124',
    location: 'Zurich, CH',
    rate: '₹6000',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtTfCAokDmRpVmxug0R8vhH6t-R78GS5NRG4HlhjDKAADQ1VK9_aUG7cSccD4r7kcDh_RaWhLuHfRgbpCUTeFlNnqfKabEgG9hnDTsv2q6d7m9YTZL4dEcA0KFf0hdgVtyn1sslDFpR6KUkxhGAsGlEGuw5BwRjV6fCGlP9G_0R1yUmOmrndJI3Digq_lyGjd-BkNLlXEFDL0Q7qxz0FGC7kqpGHXX_aESfZmabH8xjNm3wc_BXhX7fUoFR6U2Rl_ESOr78P7hVuw',
    bio: 'Vera Ló crafts immersive sonic journeys rooted in deep house and melodic textures. Based in Zurich, her sets weave warm basslines with ethereal vocals, creating atmospheres that feel both intimate and expansive. Known for her meticulous track selection and seamless mixing, she transforms dance floors into meditative spaces where rhythm and emotion converge.',
    nextAvailable: 'Oct 21, 2023',
  },
  {
    slug: 'the-collective',
    name: 'The Collective',
    genre: 'Minimal',
    bpm: '126',
    location: 'London, UK',
    rate: '€€€€',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuvf3GnbjgmslXy54fNhrm3akAB-gR1ZhHt8Ok86N1nsJIQfx0h7nDMoIqfb-efGAEcWYatLv6ScklCA49hUTlvfsNWZWgn17D_loaBFjUbAwlifMhjC-iiFwS2rBdP2d_m2bYBEuJfJQgpSuMN2ynt3b9ioWKUgaT5SBYBFKaGJOVGjrB8QL7yKrlhJfjs_9sKTNVVmn_XgNiWfiNgFOJK3sT-P_yJzLFNjXZSZ5T5zctw5Z8qjljQLqvbuGFbQiUtpKol400gfg',
    bio: 'The Collective is a London-based DJ crew pushing the boundaries of minimal techno. Their performances are stripped-back, hypnotic experiences that rely on subtlety and precision. Each member brings a unique sonic perspective, creating sets that are greater than the sum of their parts. They are fixtures at the most forward-thinking clubs in Europe, known for marathon sets that redefine endurance and focus.',
    nextAvailable: 'Nov 03, 2023',
  },
  {
    slug: 'mina-k',
    name: 'Mina K',
    genre: 'Experimental',
    bpm: '--',
    location: 'Tokyo, JP',
    rate: '€€',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeCitjeYDV5X9zJzuc2i-aLScgSBhQ_ewixST0zeHJ7W_CQYwGWAohf_Hc0nMt2spxKsCtmAYmSuy-XiB4JjEJOZZvSb87HHQtFyc3fVWnpJIFK5IqmqQNgaMNz3tV99GFVwUroRzm8KkFkrtw8545YI8OizSGg_ou4DhpTFWIf10aj3UiAObLIcVHkn43SmPCN-bqWmecPh-Bq7Awnk0FaAzY7U7kjcJ0DbviSLW62LQlDCfaHyt5lBXUdXj4Za8B4H22KMwXSvY',
    bio: 'Mina K exists at the intersection of noise, ambient, and club music. Hailing from Tokyo, her performances are unpredictable, immersive events that challenge the audience\'s perception of rhythm and space. She builds soundscapes from field recordings, modular synthesis, and fractured beats, creating a world that is entirely her own. Her work has been featured in art galleries and festivals worldwide.',
    nextAvailable: 'Nov 12, 2023',
  },
  {
    slug: 'k-lfo',
    name: 'K-LFO',
    genre: 'Ambient',
    bpm: '100',
    location: 'Seoul, KR',
    rate: '€€€',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB8HHQXY76XplmpfU7xUXHwmE-ID5EbFvbxFD4jgQxOJE7x5xUcqi_5AfHzxVrr29Y2DVuj4bQkQQbM2qsGME3lV0OoCHtRlKHGov-JO58CTBzDufSi74MoPOFcUxVyZF1fLoAkh88L972POL6o_a41YXnB3EjTi4xGHiC6oJtOK2y_8F8XvXZ2iZbY6K33APeFYt1UhpeF2uMK59NDhgTzWQnzPLCUSUQSwULlosLhJR54DkYOIPCNHbyW4xoWDCuO9gDbIKIKC8',
    bio: 'K-LFO is a Seoul-based ambient and downtempo producer whose sets are deeply atmospheric and meditative. Drawing inspiration from Korean traditional music and modern electronic production, he creates lush, evolving soundscapes that transport listeners to otherworldly environments. His performances are as much visual as they are auditory, often accompanied by bespoke generative visuals.',
    nextAvailable: 'Dec 01, 2023',
  },
];

export const getArtistBySlug = (slug: string): StaticArtist | undefined => {
  return staticArtists.find((a) => a.slug === slug);
};
