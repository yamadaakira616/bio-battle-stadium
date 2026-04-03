import { STICKERS } from './stickers.js';

const byId = Object.fromEntries(STICKERS.map(s => [s.id, s]));
function card(id) { return byId[id] || STICKERS[0]; }

export const NATIONS = [
  {
    id: 'grassland', name: '草原国', nameEn: 'Grassland Kingdom',
    emoji: '🌿', color: '#22c55e', bgGrad: 'linear-gradient(160deg,#052e16,#14532d)',
    difficulty: 1, scaleMult: 0.70, reward: 60,
    team: [
      card('bio-migratory-locust'),
      card('arm-japanese-yumi-bow'),
      card('ab-mantis-with-emp'),
      card('cor-lion-hyena-army'),
      card('cas-white-lion-king'),
    ],
  },
  {
    id: 'desert', name: '砂漠国', nameEn: 'Desert Kingdom',
    emoji: '🏜️', color: '#f59e0b', bgGrad: 'linear-gradient(160deg,#451a03,#78350f)',
    difficulty: 2, scaleMult: 0.85, reward: 90,
    team: [
      card('bio-african-elephant'),
      card('arm-cavalry-saber'),
      card('ab-elephant-with-laser'),
      card('cor-elephant-rhino-army'),
      card('cas-african-elephant-king'),
    ],
  },
  {
    id: 'ocean', name: '海洋国', nameEn: 'Ocean Kingdom',
    emoji: '🌊', color: '#0ea5e9', bgGrad: 'linear-gradient(160deg,#082f49,#0c4a6e)',
    difficulty: 3, scaleMult: 1.00, reward: 120,
    team: [
      card('bio-plains-zebra'),
      card('arm-fgm148-javelin'),
      card('ab-trex-artillery-front'),
      card('cor-blue-whale-swordfish-navy'),
      card('cas-sea-turtle-king'),
    ],
  },
  {
    id: 'mountain', name: '山岳国', nameEn: 'Mountain Kingdom',
    emoji: '🏔️', color: '#94a3b8', bgGrad: 'linear-gradient(160deg,#1e293b,#334155)',
    difficulty: 4, scaleMult: 1.10, reward: 160,
    team: [
      card('bio-grizzly-bear'),
      card('arm-scottish-claymore'),
      card('ab-trex-artillery-side'),
      card('cor-gorilla-mandrill-legion'),
      card('cas-bald-eagle-king'),
    ],
  },
  {
    id: 'volcano', name: '火山国', nameEn: 'Volcano Kingdom',
    emoji: '🌋', color: '#ef4444', bgGrad: 'linear-gradient(160deg,#450a0a,#7f1d1d)',
    difficulty: 5, scaleMult: 1.20, reward: 210,
    team: [
      card('bio-tyrannosaurus-rex'),
      card('arm-plasma-beam-rifle'),
      card('ab-titanus-with-gatling'),
      card('cor-trex-triceratops-army'),
      card('cas-giant-stag-beetle-king'),
    ],
  },
  {
    id: 'ice', name: '氷雪国', nameEn: 'Ice Kingdom',
    emoji: '❄️', color: '#7dd3fc', bgGrad: 'linear-gradient(160deg,#0c1445,#1e3a5f)',
    difficulty: 6, scaleMult: 1.30, reward: 270,
    team: [
      card('bio-velociraptor'),
      card('arm-colossal-antimatter-annihilator'),
      card('ab-titanus-with-plasma-cannon'),
      card('cor-spinosaurus-stegosaurus-army'),
      card('cas-polar-bear-king'),
    ],
  },
  {
    id: 'thunder', name: '雷鳴国', nameEn: 'Thunder Kingdom',
    emoji: '⚡', color: '#fbbf24', bgGrad: 'linear-gradient(160deg,#1c1200,#292524)',
    difficulty: 7, scaleMult: 1.40, reward: 350,
    team: [
      card('bio-spinosaurus'),
      card('arm-divine-celestial-greatsword'),
      card('ab-trex-artillery-rear'),
      card('cor-velociraptor-ankylosaurus-legion'),
      card('cas-tiger-king'),
    ],
  },
  {
    id: 'shadow', name: '暗黒国', nameEn: 'Shadow Kingdom',
    emoji: '💀', color: '#a855f7', bgGrad: 'linear-gradient(160deg,#0a000f,#1a0030)',
    difficulty: 8, scaleMult: 1.50, reward: 500,
    team: [
      card('bio-devils-flower-mantis'),
      card('arm-ultimate-cosmic-staff'),
      card('ab-titanus-with-swarm-launcher'),
      card('cor-brachiosaurus-pachycephalosaurus-squadron'),
      card('cas-green-iguana-king'),
    ],
  },
];
