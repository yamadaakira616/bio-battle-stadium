const B = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
const fp = name => B + `assets/gacha/fusion/${name}.png`;

export const FUSIONS = [
  { id:'wolphin',       name:'ウルフィン',           nameEn:'Wolphin',       imagePath:fp('wolphin'),       series:'fusion' },
  { id:'gryphther',     name:'グリフサー',           nameEn:'Gryphther',     imagePath:fp('gryphther'),     series:'fusion' },
  { id:'polarplatypus', name:'ポーラプラティバス',   nameEn:'Polarplatypus', imagePath:fp('polarplatypus'), series:'fusion' },
  { id:'elephantula',   name:'エレファンタラ',       nameEn:'Elephantula',   imagePath:fp('elephantula'),   series:'fusion' },
  { id:'sharkhorse',    name:'シャークホース',       nameEn:'Sharkhorse',    imagePath:fp('sharkhorse'),    series:'fusion' },
  { id:'rhinoeagle',    name:'ライノイーグル',       nameEn:'Rhinoeagle',    imagePath:fp('rhinoeagle'),    series:'fusion' },
  { id:'lionfisher',    name:'ライオンフィッシャー', nameEn:'Lionfisher',    imagePath:fp('lionfisher'),    series:'fusion' },
  { id:'goatcepus',     name:'ゴートセパス',         nameEn:'Goatcepus',     imagePath:fp('goatcepus'),     series:'fusion' },
  { id:'ursashark',     name:'ウルサシャーク',       nameEn:'Ursashark',     imagePath:fp('ursashark'),     series:'fusion' },
  { id:'eagledeer',     name:'イーグルディア',       nameEn:'Eagledeer',     imagePath:fp('eagledeer'),     series:'fusion' },
  { id:'tigtopus',      name:'ティグタパス',         nameEn:'Tigtopus',      imagePath:fp('tigtopus'),      series:'fusion' },
  { id:'equadragon',    name:'エクアドラゴン',       nameEn:'Equadragon',    imagePath:fp('equadragon'),    series:'fusion' },
  { id:'lapinsect',     name:'ラパンセクト',         nameEn:'Lapinsect',     imagePath:fp('lapinsect'),     series:'fusion' },
  { id:'bullshark',     name:'ブルシャーク',         nameEn:'Bullshark',     imagePath:fp('bullshark'),     series:'fusion' },
  { id:'pengseal',      name:'ペングシール',         nameEn:'Pengseal',      imagePath:fp('pengseal'),      series:'fusion' },
  { id:'serpeagle',     name:'サーペイグル',         nameEn:'Serpeagle',     imagePath:fp('serpeagle'),     series:'fusion' },
  { id:'rhinomastodon', name:'ゾウサイ',             nameEn:'Rhinomastodon', imagePath:fp('rhinomastodon'), series:'fusion' },
  { id:'aerolion',      name:'エアロライオン',       nameEn:'Aerolion',      imagePath:fp('aerolion'),      series:'fusion' },
  { id:'cetashark',     name:'セタシャーク',         nameEn:'Cetashark',     imagePath:fp('cetashark'),     series:'fusion' },
  { id:'octowolf',      name:'オクタウルフ',         nameEn:'Octowolf',      imagePath:fp('octowolf'),      series:'fusion' },
  { id:'girratortoise', name:'ジラタートース',       nameEn:'Girratortoise', imagePath:fp('girratortoise'), series:'fusion' },
  { id:'crocow',        name:'クロコウ',             nameEn:'Crocow',        imagePath:fp('crocow'),        series:'fusion' },
  { id:'zebraelk',      name:'ゼブラエルク',         nameEn:'Zebraelk',      imagePath:fp('zebraelk'),      series:'fusion' },
  { id:'ursuporcine',   name:'ウルスポーキュバイン', nameEn:'Ursuporcine',   imagePath:fp('ursuporcine'),   series:'fusion' },
];
