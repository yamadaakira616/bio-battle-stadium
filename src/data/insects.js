export const DUPLICATE_COINS = 30;

export const INSECTS = [
  // ウルトラ (3)
  { id:'u01', name:'スマトラオオヒラタクワガタ', nameEn:'Dorcus titanus titanus',
    origin:'インドネシア・スマトラ', length:'25〜95mm', rarity:'ultra', world:2,
    description:'スマトラ島産の世界最大級のヒラタクワガタ。巨大な顎で挟む力が非常に強い。',
    imagePath:null, bgColor:'#1c1917', labelColor:'#fff' },

  { id:'u02', name:'メタリフェルホソアカクワガタ', nameEn:'Cyclommatus metallifer',
    origin:'インドネシア', length:'23〜99mm', rarity:'ultra', world:2,
    description:'体長の半分以上を占める巨大な大顎が特徴。金属光沢のある体色が美しい。',
    imagePath:null, bgColor:'#713f12', labelColor:'#fff' },

  { id:'u03', name:'マンディブラリスフタマタクワガタ', nameEn:'Hexarthrius mandibularis',
    origin:'インドネシア', length:'35〜110mm', rarity:'ultra', world:2,
    description:'世界最大のフタマタクワガタ。V字型の巨大な大顎が圧倒的な存在感を放つ。',
    imagePath:null, bgColor:'#1e1b4b', labelColor:'#fff' },

  // スーパーレア (9)
  { id:'s01', name:'オオクワガタ', nameEn:'Dorcus hopei binodulosus',
    origin:'日本', length:'25〜85mm', rarity:'superRare', world:2,
    description:'日本最大のクワガタ。「クワガタの王様」と呼ばれ、樹液が出るクヌギやコナラに集まる。',
    imagePath:null, bgColor:'#292524', labelColor:'#fff' },

  { id:'s02', name:'アクベシアヌスミヤマクワガタ', nameEn:'Lucanus akbesianus',
    origin:'トルコ', length:'30〜70mm', rarity:'superRare', world:2,
    description:'トルコ南部の山岳地帯に生息する希少なミヤマクワガタ。ヨーロッパ〜アジアの境界に分布。',
    imagePath:null, bgColor:'#1c1917', labelColor:'#fff' },

  { id:'s03', name:'ブケファルスミヤマクワガタ', nameEn:'Lucanus bucephalus',
    origin:'中国', length:'35〜75mm', rarity:'superRare', world:2,
    description:'中国南部の深い森に生息。力強い大顎と赤みがかった上翅が特徴的なミヤマクワガタ。',
    imagePath:null, bgColor:'#422006', labelColor:'#fff' },

  { id:'s04', name:'プラナトゥスミヤマクワガタ', nameEn:'Lucanus planatus',
    origin:'ベトナム', length:'30〜68mm', rarity:'superRare', world:2,
    description:'ベトナム高地に分布するミヤマクワガタ。扁平な体型と独特の大顎の形状が識別点。',
    imagePath:null, bgColor:'#14532d', labelColor:'#fff' },

  { id:'s05', name:'アルキデスヒラタクワガタ', nameEn:'Dorcus alcides',
    origin:'インドネシア', length:'40〜95mm', rarity:'superRare', world:2,
    description:'スマトラ・ボルネオに生息する大型ヒラタ。幅広い体と短くがっしりした大顎が特徴。',
    imagePath:null, bgColor:'#1e293b', labelColor:'#fff' },

  { id:'s06', name:'パリーフタマタクワガタ', nameEn:'Hexarthrius parryi',
    origin:'インドネシア', length:'35〜90mm', rarity:'superRare', world:2,
    description:'ボルネオ島産の大型フタマタクワガタ。鋭く二股に分かれた大顎が名前の由来。',
    imagePath:null, bgColor:'#3b1f0a', labelColor:'#fff' },

  { id:'s07', name:'ヘラクレスオオカブト', nameEn:'Dynastes hercules',
    origin:'中南米', length:'50〜171mm', rarity:'superRare', world:3,
    description:'世界最長の甲虫。ギリシャ神話の英雄ヘラクレスの名を持つ、カブトムシの王者。',
    imagePath:null, bgColor:'#365314', labelColor:'#fff' },

  { id:'s08', name:'ゴライアスオオツノハナムグリ', nameEn:'Goliathus goliatus',
    origin:'アフリカ', length:'50〜110mm', rarity:'superRare', world:2,
    description:'世界最重量の昆虫のひとつ。幼虫時の体重は100gを超えることも。旧約聖書の巨人に由来する名前。',
    imagePath:null, bgColor:'#713f12', labelColor:'#fff' },

  { id:'s09', name:'ゲンジボタル（幻光）', nameEn:'Luciola cruciata',
    origin:'日本', length:'15〜18mm', rarity:'superRare', world:3,
    description:'日本の清流に生息するホタルの代表種。幻想的な発光パターンは地域によって異なる。',
    imagePath:null, bgColor:'#0c1a1a', labelColor:'#00ff88' },

  // レア (15)
  { id:'r01', name:'ミヤマクワガタ', nameEn:'Lucanus maculifemoratus',
    origin:'日本', length:'27〜79mm', rarity:'rare', world:2,
    description:'日本の山地に生息するクワガタ。頭部の耳状突起と金色の産毛が特徴。夏の夜に活動する。',
    imagePath:null, bgColor:'#78350f', labelColor:'#fff' },

  { id:'r02', name:'オオヒラタクワガタ', nameEn:'Dorcus titanus',
    origin:'東南アジア', length:'24〜90mm', rarity:'rare', world:2,
    description:'東南アジア各地に広く分布する大型ヒラタクワガタ。亜種・地域変異が非常に豊富。',
    imagePath:null, bgColor:'#1c1917', labelColor:'#fff' },

  { id:'r03', name:'ディディエールシカクワガタ', nameEn:'Rhaetulus didieri',
    origin:'アフリカ', length:'35〜80mm', rarity:'rare', world:2,
    description:'アフリカ中部の熱帯雨林に生息。シカの角のように細長く伸びた大顎が個性的。',
    imagePath:null, bgColor:'#3b1f0a', labelColor:'#fff' },

  { id:'r04', name:'ネブトクワガタ', nameEn:'Aegus laevicollis',
    origin:'日本', length:'15〜40mm', rarity:'rare', world:2,
    description:'日本各地の朽木に生息する小型のクワガタ。光沢のある黒い体と短い大顎が特徴。',
    imagePath:null, bgColor:'#292524', labelColor:'#fff' },

  { id:'r05', name:'アルケスツヤクワガタ', nameEn:'Odontolabis alces',
    origin:'インドネシア', length:'40〜85mm', rarity:'rare', world:2,
    description:'ボルネオ・スマトラに分布するツヤクワガタ。ピカピカに輝く黒い体色が美しい。',
    imagePath:null, bgColor:'#14532d', labelColor:'#fff' },

  { id:'r06', name:'タランドゥスオオツヤクワガタ', nameEn:'Mesotopus tarandus',
    origin:'アフリカ', length:'40〜85mm', rarity:'rare', world:2,
    description:'コンゴ盆地の熱帯雨林に生息。漆黒でミラーのような光沢が特徴。飼育難易度が高い。',
    imagePath:null, bgColor:'#1c1917', labelColor:'#fff' },

  { id:'r07', name:'エラフスホソアカクワガタ', nameEn:'Cyclommatus elaphus',
    origin:'インドネシア', length:'30〜85mm', rarity:'rare', world:2,
    description:'スマトラ島産のホソアカクワガタ最大種。細長い体と鋭い大顎は樹上生活に適応している。',
    imagePath:null, bgColor:'#422006', labelColor:'#fff' },

  { id:'r08', name:'ヤマトタマムシ', nameEn:'Chrysochroa fulgidissima',
    origin:'日本', length:'30〜41mm', rarity:'rare', world:1,
    description:'日本最美の甲虫とも呼ばれる。緑・赤・金の金属光沢は構造色によるもので、死後も色が変わらない。',
    imagePath:null, bgColor:'#166534', labelColor:'#fff' },

  { id:'r09', name:'アトラスオオカブト', nameEn:'Chalcosoma atlas',
    origin:'東南アジア', length:'40〜130mm', rarity:'rare', world:2,
    description:'東南アジアの3本角カブトムシ。ギリシャ神話の巨人アトラスの名を持つ大型種。',
    imagePath:null, bgColor:'#1e1b4b', labelColor:'#fff' },

  { id:'r10', name:'レギウスオオツヤクワガタ', nameEn:'Mesotopus regius',
    origin:'カメルーン', length:'45〜90mm', rarity:'rare', world:2,
    description:'カメルーン産のオオツヤクワガタ。「王」を意味するRegiusの名の通り、威厳ある黒光りの体を持つ。',
    imagePath:null, bgColor:'#292524', labelColor:'#fff' },

  { id:'r11', name:'ニジイロクワガタ', nameEn:'Phalacrognathus muelleri',
    origin:'オーストラリア', length:'40〜70mm', rarity:'rare', world:2,
    description:'オーストラリア北部原産。虹色に輝く美しい体色で世界中のコレクターに人気が高い。',
    imagePath:null, bgColor:'#14532d', labelColor:'#fff' },

  { id:'r12', name:'ギラファノコギリクワガタ', nameEn:'Prosopocoilus giraffa',
    origin:'インドネシア', length:'45〜118mm', rarity:'rare', world:2,
    description:'世界最大のノコギリクワガタ。キリンのように長い大顎を持ち、闘争心が非常に強い。',
    imagePath:null, bgColor:'#713f12', labelColor:'#fff' },

  { id:'r13', name:'ヨーロッパミヤマクワガタ', nameEn:'Lucanus cervus',
    origin:'ヨーロッパ', length:'25〜87mm', rarity:'rare', world:2,
    description:'ヨーロッパ最大のクワガタ。雄の大顎はシカの角に似ており、英名も"Stag Beetle"（雄鹿の甲虫）。',
    imagePath:null, bgColor:'#78350f', labelColor:'#fff' },

  { id:'r14', name:'コーカサスオオカブト', nameEn:'Chalcosoma caucasus',
    origin:'東南アジア', length:'60〜130mm', rarity:'rare', world:2,
    description:'東南アジア産の3本角カブトムシ最大種。三本の角で相手を挟み込む戦闘スタイルが迫力満点。',
    imagePath:null, bgColor:'#1c1917', labelColor:'#fff' },

  { id:'r15', name:'アクタエオンゾウカブト', nameEn:'Megasoma actaeon',
    origin:'中南米', length:'50〜135mm', rarity:'rare', world:3,
    description:'アマゾン流域に生息する世界最重量級のカブトムシのひとつ。分厚い体に短く太い角を持つ。',
    imagePath:null, bgColor:'#365314', labelColor:'#fff' },

  // ノーマル (12)
  { id:'c01', name:'コクワガタ', nameEn:'Dorcus rectus',
    origin:'日本', length:'17〜54mm', rarity:'common', world:1,
    description:'日本全国の雑木林に生息するクワガタ。小型だが飼育しやすく、クワガタ入門種として人気。',
    imagePath:null, bgColor:'#d1fae5' },

  { id:'c02', name:'ノコギリクワガタ', nameEn:'Prosopocoilus inclinatus',
    origin:'日本', length:'26〜74mm', rarity:'common', world:1,
    description:'日本で最もよく見られるクワガタのひとつ。ギザギザのノコギリ状の大顎が名前の由来。',
    imagePath:null, bgColor:'#fef3c7' },

  { id:'c03', name:'スジクワガタ', nameEn:'Dorcus striatipennis',
    origin:'日本', length:'19〜42mm', rarity:'common', world:1,
    description:'上翅に細かな縦筋（スジ）があるのが名前の由来。コクワガタに似るが、より扁平な体型。',
    imagePath:null, bgColor:'#e7e5e4' },

  { id:'c04', name:'ヒラタクワガタ', nameEn:'Dorcus titanus pilifer',
    origin:'日本', length:'25〜75mm', rarity:'common', world:1,
    description:'扁平な体型でヒラタ（平た）の名を持つ。挟む力が強く、クワガタ相撲での強さで知られる。',
    imagePath:null, bgColor:'#dbeafe' },

  { id:'c05', name:'カブトムシ', nameEn:'Trypoxylus dichotomus',
    origin:'日本', length:'30〜85mm', rarity:'common', world:1,
    description:'夏の王者。日本を代表する甲虫で、オスの頭部と胸部に計2本の角を持つ。',
    imagePath:null, bgColor:'#dcfce7' },

  { id:'c06', name:'テントウムシ', nameEn:'Coccinella septempunctata',
    origin:'世界共通', length:'5〜8mm', rarity:'common', world:1,
    description:'7つの黒い斑点を持つ赤い甲虫。アブラムシを食べる益虫として農家にも好まれる。',
    imagePath:null, bgColor:'#fee2e2' },

  { id:'c07', name:'カナブン', nameEn:'Rhomborrhina japonica',
    origin:'日本', length:'24〜30mm', rarity:'common', world:1,
    description:'緑色の金属光沢を持つコガネムシの仲間。クワガタと同じ樹液に集まる常連。',
    imagePath:null, bgColor:'#d9f99d' },

  { id:'c08', name:'ショウリョウバッタ', nameEn:'Acrida cinerea',
    origin:'日本', length:'35〜80mm', rarity:'common', world:1,
    description:'日本最大のバッタ。細長い体と顔が特徴で、跳躍力が高く草原を素早く移動する。',
    imagePath:null, bgColor:'#ecfccb' },

  { id:'c09', name:'ナナフシ', nameEn:'Phraortes elongatus',
    origin:'日本', length:'70〜130mm', rarity:'common', world:1,
    description:'木の枝そっくりの体型で擬態する昆虫。「七節」と書き、節の多い体が名前の由来。',
    imagePath:null, bgColor:'#d1fae5' },

  { id:'c10', name:'オニヤンマ', nameEn:'Anotogaster sieboldii',
    origin:'日本', length:'90〜110mm', rarity:'common', world:1,
    description:'日本最大のトンボ。時速70kmで飛翔し、ハチやアブも捕食する。渓流沿いに生息する。',
    imagePath:null, bgColor:'#cffafe' },

  { id:'c11', name:'アキアカネ', nameEn:'Sympetrum frequens',
    origin:'日本', length:'35〜45mm', rarity:'common', world:1,
    description:'秋の日本を代表する赤いトンボ。夏は涼しい山地で過ごし、秋になると平地に降りてくる。',
    imagePath:null, bgColor:'#fee2e2' },

  { id:'c12', name:'モンシロチョウ', nameEn:'Pieris rapae',
    origin:'日本', length:'40〜60mm', rarity:'common', world:1,
    description:'日本で最もよく見られるチョウ。白い羽に黒い紋が入り、キャベツ畑でよく見かける。',
    imagePath:null, bgColor:'#f0fdf4' },
];

export function rollGacha() {
  const rand = Math.random() * 100;
  let rarity;
  if (rand < 3)       rarity = 'ultra';
  else if (rand < 15) rarity = 'superRare';
  else if (rand < 40) rarity = 'rare';
  else                rarity = 'common';
  const pool = INSECTS.filter(i => i.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}
