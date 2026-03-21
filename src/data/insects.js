export const DUPLICATE_COINS = 10;

export const INSECTS = [
  // ===== レジェンドレア (1種) =====
  { id:'lg01', name:'ダイオウヒラタクワガタ', nameEn:'Dorcus titanus palawanicus',
    origin:'フィリピン・パラワン島', length:'25〜100mm', rarity:'legend', world:2,
    description:'世界最大級のヒラタクワガタ。パラワン島産の亜種は体長100mmを超える個体も存在し、驚異的な顎の力を誇る伝説の昆虫。',
    imagePath:'/assets/insects/lg01.jpg', bgColor:'#0f0a1e', labelColor:'#ffd700' },

  // ===== ウルトラ (6種) =====
  { id:'u01', name:'スマトラオオヒラタクワガタ', nameEn:'Dorcus titanus titanus',
    origin:'インドネシア・スマトラ', length:'25〜95mm', rarity:'ultra', world:2,
    description:'スマトラ島産の世界最大級のヒラタクワガタ。巨大な顎で挟む力が非常に強い。',
    imagePath:'/assets/insects/u01.jpg', bgColor:'#1c1917', labelColor:'#fff' },

  { id:'u02', name:'メタリフェルホソアカクワガタ', nameEn:'Cyclommatus metallifer',
    origin:'インドネシア', length:'23〜99mm', rarity:'ultra', world:2,
    description:'体長の半分以上を占める巨大な大顎が特徴。金属光沢のある体色が美しい。',
    imagePath:'/assets/insects/u02.jpg', bgColor:'#713f12', labelColor:'#fff' },

  { id:'u03', name:'マンディブラリスフタマタクワガタ', nameEn:'Hexarthrius mandibularis',
    origin:'インドネシア', length:'35〜110mm', rarity:'ultra', world:2,
    description:'世界最大のフタマタクワガタ。V字型の巨大な大顎が圧倒的な存在感を放つ。',
    imagePath:'/assets/insects/u03.jpg', bgColor:'#1e1b4b', labelColor:'#fff' },

  { id:'u04', name:'オウゴンオニクワガタ', nameEn:'Lamprima adolphinae',
    origin:'パプアニューギニア', length:'30〜62mm', rarity:'ultra', world:2,
    description:'黄金色〜緑色に輝く体色が圧倒的に美しい。同種でも個体によって体色が大きく異なる宝石のような甲虫。',
    imagePath:'/assets/insects/u04.jpg', bgColor:'#713f12', labelColor:'#fff' },

  { id:'u05', name:'ネプチューンオオカブト', nameEn:'Dynastes neptunus',
    origin:'コロンビア・エクアドル', length:'50〜157mm', rarity:'ultra', world:3,
    description:'アンデス山脈の高地に生息する幻の大型カブトムシ。3本の巨大な角が神話の海神ネプチューンを想起させる。',
    imagePath:'/assets/insects/u05.jpg', bgColor:'#064e3b', labelColor:'#fff' },

  { id:'u06', name:'モーレンカンプオウゴンオニクワガタ', nameEn:'Lamprima moellenkampi',
    origin:'ニューギニア', length:'28〜65mm', rarity:'ultra', world:2,
    description:'オウゴンオニクワガタの仲間で最も大型になる種。青みがかった金属光沢が神秘的。',
    imagePath:'/assets/insects/u06.jpg', bgColor:'#1e3a5f', labelColor:'#fff' },

  // ===== スーパーレア (18種) =====
  { id:'s01', name:'オオクワガタ', nameEn:'Dorcus hopei binodulosus',
    origin:'日本', length:'25〜85mm', rarity:'superRare', world:2,
    description:'日本最大のクワガタ。「クワガタの王様」と呼ばれ、樹液が出るクヌギやコナラに集まる。',
    imagePath:'/assets/insects/s01.jpg', bgColor:'#292524', labelColor:'#fff' },

  { id:'s02', name:'アクベシアヌスミヤマクワガタ', nameEn:'Lucanus akbesianus',
    origin:'トルコ', length:'30〜70mm', rarity:'superRare', world:2,
    description:'トルコ南部の山岳地帯に生息する希少なミヤマクワガタ。ヨーロッパ〜アジアの境界に分布。',
    imagePath:'/assets/insects/s02.jpg', bgColor:'#1c1917', labelColor:'#fff' },

  { id:'s03', name:'ブケファルスミヤマクワガタ', nameEn:'Lucanus bucephalus',
    origin:'中国', length:'35〜75mm', rarity:'superRare', world:2,
    description:'中国南部の深い森に生息。力強い大顎と赤みがかった上翅が特徴的なミヤマクワガタ。',
    imagePath:'/assets/insects/s03.jpg', bgColor:'#422006', labelColor:'#fff' },

  { id:'s04', name:'プラナトゥスミヤマクワガタ', nameEn:'Lucanus planatus',
    origin:'ベトナム', length:'30〜68mm', rarity:'superRare', world:2,
    description:'ベトナム高地に分布するミヤマクワガタ。扁平な体型と独特の大顎の形状が識別点。',
    imagePath:'/assets/insects/s04.jpg', bgColor:'#14532d', labelColor:'#fff' },

  { id:'s05', name:'アルキデスヒラタクワガタ', nameEn:'Dorcus alcides',
    origin:'インドネシア', length:'40〜95mm', rarity:'superRare', world:2,
    description:'スマトラ・ボルネオに生息する大型ヒラタ。幅広い体と短くがっしりした大顎が特徴。',
    imagePath:'/assets/insects/s05.jpg', bgColor:'#1e293b', labelColor:'#fff' },

  { id:'s06', name:'パリーフタマタクワガタ', nameEn:'Hexarthrius parryi',
    origin:'インドネシア', length:'35〜90mm', rarity:'superRare', world:2,
    description:'ボルネオ島産の大型フタマタクワガタ。鋭く二股に分かれた大顎が名前の由来。',
    imagePath:'/assets/insects/s06.jpg', bgColor:'#3b1f0a', labelColor:'#fff' },

  { id:'s07', name:'ヘラクレスオオカブト', nameEn:'Dynastes hercules',
    origin:'中南米', length:'50〜171mm', rarity:'superRare', world:3,
    description:'世界最長の甲虫。ギリシャ神話の英雄ヘラクレスの名を持つ、カブトムシの王者。',
    imagePath:'/assets/insects/s07.jpg', bgColor:'#365314', labelColor:'#fff' },

  { id:'s08', name:'ゴライアスオオツノハナムグリ', nameEn:'Goliathus goliatus',
    origin:'アフリカ', length:'50〜110mm', rarity:'superRare', world:2,
    description:'世界最重量の昆虫のひとつ。幼虫時の体重は100gを超えることも。旧約聖書の巨人に由来する名前。',
    imagePath:'/assets/insects/s08.jpg', bgColor:'#713f12', labelColor:'#fff' },

  { id:'s09', name:'ゲンジボタル（幻光）', nameEn:'Luciola cruciata',
    origin:'日本', length:'15〜18mm', rarity:'superRare', world:3,
    description:'日本の清流に生息するホタルの代表種。幻想的な発光パターンは地域によって異なる。',
    imagePath:'/assets/insects/s09.jpg', bgColor:'#0c1a1a', labelColor:'#00ff88' },

  { id:'s10', name:'パラワンオオヒラタクワガタ', nameEn:'Dorcus titanus palawanicus',
    origin:'フィリピン・パラワン島', length:'45〜106mm', rarity:'superRare', world:2,
    description:'パラワン島産のヒラタクワガタ最大亜種。鋭く発達した大顎の挟む力は昆虫界トップクラス。',
    imagePath:'/assets/insects/s10.jpg', bgColor:'#1c1917', labelColor:'#fff' },

  { id:'s11', name:'グラントシロカブト', nameEn:'Dynastes granti',
    origin:'アメリカ（アリゾナ）', length:'40〜117mm', rarity:'superRare', world:3,
    description:'北アメリカ産最大のカブトムシ。白っぽい体に黒い斑点模様が入る。高山のトネリコの木に集まる。',
    imagePath:'/assets/insects/s11.jpg', bgColor:'#d6d3d1', labelColor:'#1c1917' },

  { id:'s12', name:'ビノクルスミヤマクワガタ', nameEn:'Lucanus binoculatus',
    origin:'インドネシア', length:'35〜72mm', rarity:'superRare', world:2,
    description:'大きな複眼が特徴的なミヤマクワガタ。ニューギニア周辺に生息し、独特な体型を持つ。',
    imagePath:'/assets/insects/s12.jpg', bgColor:'#422006', labelColor:'#fff' },

  { id:'s13', name:'アヌビスゾウカブト', nameEn:'Megasoma elephas',
    origin:'メキシコ・中南米', length:'50〜135mm', rarity:'superRare', world:3,
    description:'世界最重量級のカブトムシの一種。密な金色の毛に覆われた太い角が特徴的。',
    imagePath:'/assets/insects/s13.jpg', bgColor:'#713f12', labelColor:'#fff' },

  { id:'s14', name:'ラコダールツヤクワガタ', nameEn:'Odontolabis lacordairei',
    origin:'インド・スリランカ', length:'40〜90mm', rarity:'superRare', world:2,
    description:'インド亜大陸に生息する美しいツヤクワガタ。漆黒の体に細長い大顎が品格を放つ。',
    imagePath:'/assets/insects/s14.jpg', bgColor:'#1c1917', labelColor:'#fff' },

  { id:'s15', name:'モリモトミヤマクワガタ', nameEn:'Lucanus moriutii',
    origin:'台湾', length:'35〜74mm', rarity:'superRare', world:2,
    description:'台湾の高山に生息する大型ミヤマ。日本産のミヤマクワガタに近縁で、力強い大顎が特徴。',
    imagePath:'/assets/insects/s15.jpg', bgColor:'#292524', labelColor:'#fff' },

  { id:'s16', name:'ワラストンツヤクワガタ', nameEn:'Odontolabis wollastoni',
    origin:'マレーシア', length:'38〜88mm', rarity:'superRare', world:2,
    description:'ボルネオ産のツヤクワガタ。黒光りする体と特徴的な形状の大顎を持つ。',
    imagePath:'/assets/insects/s16.jpg', bgColor:'#1c1917', labelColor:'#fff' },

  { id:'s17', name:'チャルコソマ・モエレンカンピ', nameEn:'Chalcosoma moellenkampi',
    origin:'ボルネオ', length:'50〜110mm', rarity:'superRare', world:2,
    description:'ボルネオ産の巨大な3本角カブトムシ。コーカサスオオカブトと近縁で、密林の王者として君臨する。',
    imagePath:'/assets/insects/s17.jpg', bgColor:'#14532d', labelColor:'#fff' },

  { id:'s18', name:'ヒルスシカクワガタ', nameEn:'Rhaetus westwoodi',
    origin:'インド・ネパール', length:'40〜80mm', rarity:'superRare', world:2,
    description:'ヒマラヤ山麓に生息する大型シカクワガタ。独特の曲線を描く大顎が美しく、コレクター垂涎の的。',
    imagePath:'/assets/insects/s18.jpg', bgColor:'#3b1f0a', labelColor:'#fff' },

  // ===== レア (30種) =====
  { id:'r01', name:'ミヤマクワガタ', nameEn:'Lucanus maculifemoratus',
    origin:'日本', length:'27〜79mm', rarity:'rare', world:2,
    description:'日本の山地に生息するクワガタ。頭部の耳状突起と金色の産毛が特徴。夏の夜に活動する。',
    imagePath:'/assets/insects/r01.jpg', bgColor:'#78350f', labelColor:'#fff' },

  { id:'r02', name:'オオヒラタクワガタ', nameEn:'Dorcus titanus',
    origin:'東南アジア', length:'24〜90mm', rarity:'rare', world:2,
    description:'東南アジア各地に広く分布する大型ヒラタクワガタ。亜種・地域変異が非常に豊富。',
    imagePath:'/assets/insects/r02.jpg', bgColor:'#1c1917', labelColor:'#fff' },

  { id:'r03', name:'ディディエールシカクワガタ', nameEn:'Rhaetulus didieri',
    origin:'アフリカ', length:'35〜80mm', rarity:'rare', world:2,
    description:'アフリカ中部の熱帯雨林に生息。シカの角のように細長く伸びた大顎が個性的。',
    imagePath:'/assets/insects/r03.jpg', bgColor:'#3b1f0a', labelColor:'#fff' },

  { id:'r04', name:'ネブトクワガタ', nameEn:'Aegus laevicollis',
    origin:'日本', length:'15〜40mm', rarity:'rare', world:2,
    description:'日本各地の朽木に生息する小型のクワガタ。光沢のある黒い体と短い大顎が特徴。',
    imagePath:'/assets/insects/r04.jpg', bgColor:'#292524', labelColor:'#fff' },

  { id:'r05', name:'アルケスツヤクワガタ', nameEn:'Odontolabis alces',
    origin:'インドネシア', length:'40〜85mm', rarity:'rare', world:2,
    description:'ボルネオ・スマトラに分布するツヤクワガタ。ピカピカに輝く黒い体色が美しい。',
    imagePath:'/assets/insects/r05.jpg', bgColor:'#14532d', labelColor:'#fff' },

  { id:'r06', name:'タランドゥスオオツヤクワガタ', nameEn:'Mesotopus tarandus',
    origin:'アフリカ', length:'40〜85mm', rarity:'rare', world:2,
    description:'コンゴ盆地の熱帯雨林に生息。漆黒でミラーのような光沢が特徴。飼育難易度が高い。',
    imagePath:'/assets/insects/r06.jpg', bgColor:'#1c1917', labelColor:'#fff' },

  { id:'r07', name:'エラフスホソアカクワガタ', nameEn:'Cyclommatus elaphus',
    origin:'インドネシア', length:'30〜85mm', rarity:'rare', world:2,
    description:'スマトラ島産のホソアカクワガタ最大種。細長い体と鋭い大顎は樹上生活に適応している。',
    imagePath:'/assets/insects/r07.jpg', bgColor:'#422006', labelColor:'#fff' },

  { id:'r08', name:'ヤマトタマムシ', nameEn:'Chrysochroa fulgidissima',
    origin:'日本', length:'30〜41mm', rarity:'rare', world:1,
    description:'日本最美の甲虫とも呼ばれる。緑・赤・金の金属光沢は構造色によるもので、死後も色が変わらない。',
    imagePath:'/assets/insects/r08.jpg', bgColor:'#166534', labelColor:'#fff' },

  { id:'r09', name:'アトラスオオカブト', nameEn:'Chalcosoma atlas',
    origin:'東南アジア', length:'40〜130mm', rarity:'rare', world:2,
    description:'東南アジアの3本角カブトムシ。ギリシャ神話の巨人アトラスの名を持つ大型種。',
    imagePath:'/assets/insects/r09.jpg', bgColor:'#1e1b4b', labelColor:'#fff' },

  { id:'r10', name:'レギウスオオツヤクワガタ', nameEn:'Mesotopus regius',
    origin:'カメルーン', length:'45〜90mm', rarity:'rare', world:2,
    description:'カメルーン産のオオツヤクワガタ。「王」を意味するRegiusの名の通り、威厳ある黒光りの体を持つ。',
    imagePath:'/assets/insects/r10.jpg', bgColor:'#292524', labelColor:'#fff' },

  { id:'r11', name:'ニジイロクワガタ', nameEn:'Phalacrognathus muelleri',
    origin:'オーストラリア', length:'40〜70mm', rarity:'rare', world:2,
    description:'オーストラリア北部原産。虹色に輝く美しい体色で世界中のコレクターに人気が高い。',
    imagePath:'/assets/insects/r11.jpg', bgColor:'#14532d', labelColor:'#fff' },

  { id:'r12', name:'ギラファノコギリクワガタ', nameEn:'Prosopocoilus giraffa',
    origin:'インドネシア', length:'45〜118mm', rarity:'rare', world:2,
    description:'世界最大のノコギリクワガタ。キリンのように長い大顎を持ち、闘争心が非常に強い。',
    imagePath:'/assets/insects/r12.jpg', bgColor:'#713f12', labelColor:'#fff' },

  { id:'r13', name:'ヨーロッパミヤマクワガタ', nameEn:'Lucanus cervus',
    origin:'ヨーロッパ', length:'25〜87mm', rarity:'rare', world:2,
    description:'ヨーロッパ最大のクワガタ。雄の大顎はシカの角に似ており、英名も"Stag Beetle"。',
    imagePath:'/assets/insects/r13.jpg', bgColor:'#78350f', labelColor:'#fff' },

  { id:'r14', name:'コーカサスオオカブト', nameEn:'Chalcosoma caucasus',
    origin:'東南アジア', length:'60〜130mm', rarity:'rare', world:2,
    description:'東南アジア産の3本角カブトムシ最大種。三本の角で相手を挟み込む戦闘スタイルが迫力満点。',
    imagePath:'/assets/insects/r14.jpg', bgColor:'#1c1917', labelColor:'#fff' },

  { id:'r15', name:'アクタエオンゾウカブト', nameEn:'Megasoma actaeon',
    origin:'中南米', length:'50〜135mm', rarity:'rare', world:3,
    description:'アマゾン流域に生息する世界最重量級のカブトムシのひとつ。分厚い体に短く太い角を持つ。',
    imagePath:'/assets/insects/r15.jpg', bgColor:'#365314', labelColor:'#fff' },

  { id:'r16', name:'ゴホンヅノカブト', nameEn:'Eupatorus gracilicornis',
    origin:'タイ・ベトナム', length:'35〜80mm', rarity:'rare', world:2,
    description:'頭部2本・胸部3本の計5本の角を持つユニークなカブトムシ。東南アジアの山地に生息する。',
    imagePath:'/assets/insects/r16.jpg', bgColor:'#365314', labelColor:'#fff' },

  { id:'r17', name:'ヘラジカオオカブト', nameEn:'Dynastes hyllus',
    origin:'メキシコ・中米', length:'45〜120mm', rarity:'rare', world:3,
    description:'メキシコ産のヘラクレスに近縁な大型カブトムシ。青緑色の斑点模様が美しい。',
    imagePath:'/assets/insects/r17.jpg', bgColor:'#064e3b', labelColor:'#fff' },

  { id:'r18', name:'アマミミヤマクワガタ', nameEn:'Lucanus sasakii',
    origin:'奄美大島', length:'30〜65mm', rarity:'rare', world:2,
    description:'奄美大島固有のミヤマクワガタ。日本のミヤマクワガタと近縁だが、大顎の形状に違いがある。',
    imagePath:'/assets/insects/r18.jpg', bgColor:'#78350f', labelColor:'#fff' },

  { id:'r19', name:'フォルスターフタマタクワガタ', nameEn:'Hexarthrius forsteri',
    origin:'スマトラ', length:'30〜80mm', rarity:'rare', world:2,
    description:'スマトラ産のフタマタクワガタ。パリーフタマタより小型だが、鋭い大顎の形状が独特。',
    imagePath:'/assets/insects/r19.jpg', bgColor:'#422006', labelColor:'#fff' },

  { id:'r20', name:'ハナカマキリ', nameEn:'Hymenopus coronatus',
    origin:'東南アジア', length:'25〜70mm', rarity:'rare', world:1,
    description:'蘭の花に擬態した世界一美しいカマキリ。ピンク色の体と花びらのような脚が特徴。',
    imagePath:'/assets/insects/r20.jpg', bgColor:'#fce7f3', labelColor:'#831843' },

  { id:'r21', name:'コノハムシ', nameEn:'Phyllium giganteum',
    origin:'マレーシア', length:'80〜105mm', rarity:'rare', world:1,
    description:'葉っぱそっくりの体型を持つ世界最大のコノハムシ。葉の葉脈まで再現した完璧な擬態が驚異的。',
    imagePath:'/assets/insects/r21.jpg', bgColor:'#166534', labelColor:'#fff' },

  { id:'r22', name:'ナナフシ（世界最長種）', nameEn:'Phobaeticus chani',
    origin:'ボルネオ', length:'350〜565mm', rarity:'rare', world:1,
    description:'世界最長の昆虫として記録を持つ。足を広げると50cm以上にもなるボルネオ固有種。',
    imagePath:'/assets/insects/r22.jpg', bgColor:'#166534', labelColor:'#fff' },

  { id:'r23', name:'モルフォチョウ', nameEn:'Morpho peleides',
    origin:'中南米', length:'90〜130mm', rarity:'rare', world:1,
    description:'熱帯雨林を飛び交う宝石のような青い蝶。翅の青色は色素ではなく光の干渉による構造色。',
    imagePath:'/assets/insects/r23.jpg', bgColor:'#1e3a5f', labelColor:'#fff' },

  { id:'r24', name:'アカアシクワガタ', nameEn:'Dorcus rubrofemoratus',
    origin:'日本', length:'20〜55mm', rarity:'rare', world:2,
    description:'赤みがかった脚が名前の由来。日本の山地に生息し、ブナ科の朽木に産卵する。',
    imagePath:'/assets/insects/r24.jpg', bgColor:'#78350f', labelColor:'#fff' },

  { id:'r25', name:'クロカタゾウムシ', nameEn:'Pachyrhynchus infernalis',
    origin:'フィリピン', length:'15〜22mm', rarity:'rare', world:1,
    description:'世界で最も硬い昆虫の一つ。鱗粉の金属光沢が宝石のようで、車に踏まれても死なないほどの硬さを持つ。',
    imagePath:'/assets/insects/r25.jpg', bgColor:'#1c1917', labelColor:'#fff' },

  { id:'r26', name:'ギガスアリ', nameEn:'Camponotus gigas',
    origin:'東南アジア', length:'18〜28mm', rarity:'rare', world:1,
    description:'世界最大のアリの一種。強力な顎でなんでも噛み切り、熱帯林の生態系で重要な役割を担う。',
    imagePath:'/assets/insects/r26.jpg', bgColor:'#292524', labelColor:'#fff' },

  { id:'r27', name:'ウスバカゲロウ（大型種）', nameEn:'Palpares libelluloides',
    origin:'南ヨーロッパ・中東', length:'60〜80mm', rarity:'rare', world:1,
    description:'ウスバカゲロウの仲間で最大級。透き通った翅に美しい斑紋があり、優雅に飛翔する。',
    imagePath:'/assets/insects/r27.jpg', bgColor:'#fef9c3', labelColor:'#713f12' },

  { id:'r28', name:'タイワンタケクマバチ', nameEn:'Xylocopa tranquebarorum',
    origin:'東南アジア・台湾', length:'20〜28mm', rarity:'rare', world:1,
    description:'竹に穴を掘って巣を作るクマバチの仲間。全身が青黒く輝き、ハチとは思えない美しさを持つ。',
    imagePath:'/assets/insects/r28.jpg', bgColor:'#1e293b', labelColor:'#fff' },

  { id:'r29', name:'タイタマムシ', nameEn:'Chrysochroa buqueti',
    origin:'タイ・東南アジア', length:'40〜65mm', rarity:'rare', world:1,
    description:'タイ産のタマムシ類最大種のひとつ。鮮やかな赤・緑・金の金属光沢が太陽光で輝く宝石。',
    imagePath:'/assets/insects/r29.jpg', bgColor:'#166534', labelColor:'#fff' },

  { id:'r30', name:'ハナカマキリ（白型）', nameEn:'Hymenopus coronatus var.',
    origin:'スマトラ', length:'25〜65mm', rarity:'rare', world:1,
    description:'真っ白な体色のハナカマキリ変異型。白い花に完全に溶け込んだ擬態は自然界の奇跡。',
    imagePath:'/assets/insects/r30.jpg', bgColor:'#f0fdf4', labelColor:'#166534' },

  // ===== ノーマル (24種) =====
  { id:'c01', name:'コクワガタ', nameEn:'Dorcus rectus',
    origin:'日本', length:'17〜54mm', rarity:'common', world:1,
    description:'日本全国の雑木林に生息するクワガタ。小型だが飼育しやすく、クワガタ入門種として人気。',
    imagePath:'/assets/insects/c01.jpg', bgColor:'#d1fae5' },

  { id:'c02', name:'ノコギリクワガタ', nameEn:'Prosopocoilus inclinatus',
    origin:'日本', length:'26〜74mm', rarity:'common', world:1,
    description:'日本で最もよく見られるクワガタのひとつ。ギザギザのノコギリ状の大顎が名前の由来。',
    imagePath:'/assets/insects/c02.jpg', bgColor:'#fef3c7' },

  { id:'c03', name:'スジクワガタ', nameEn:'Dorcus striatipennis',
    origin:'日本', length:'19〜42mm', rarity:'common', world:1,
    description:'上翅に細かな縦筋（スジ）があるのが名前の由来。コクワガタに似るが、より扁平な体型。',
    imagePath:'/assets/insects/c03.jpg', bgColor:'#e7e5e4' },

  { id:'c04', name:'ヒラタクワガタ', nameEn:'Dorcus titanus pilifer',
    origin:'日本', length:'25〜75mm', rarity:'common', world:1,
    description:'扁平な体型でヒラタ（平た）の名を持つ。挟む力が強く、クワガタ相撲での強さで知られる。',
    imagePath:'/assets/insects/c04.jpg', bgColor:'#dbeafe' },

  { id:'c05', name:'カブトムシ', nameEn:'Trypoxylus dichotomus',
    origin:'日本', length:'30〜85mm', rarity:'common', world:1,
    description:'夏の王者。日本を代表する甲虫で、オスの頭部と胸部に計2本の角を持つ。',
    imagePath:'/assets/insects/c05.jpg', bgColor:'#dcfce7' },

  { id:'c06', name:'テントウムシ', nameEn:'Coccinella septempunctata',
    origin:'世界共通', length:'5〜8mm', rarity:'common', world:1,
    description:'7つの黒い斑点を持つ赤い甲虫。アブラムシを食べる益虫として農家にも好まれる。',
    imagePath:'/assets/insects/c06.jpg', bgColor:'#fee2e2' },

  { id:'c07', name:'カナブン', nameEn:'Rhomborrhina japonica',
    origin:'日本', length:'24〜30mm', rarity:'common', world:1,
    description:'緑色の金属光沢を持つコガネムシの仲間。クワガタと同じ樹液に集まる常連。',
    imagePath:'/assets/insects/c07.jpg', bgColor:'#d9f99d' },

  { id:'c08', name:'ショウリョウバッタ', nameEn:'Acrida cinerea',
    origin:'日本', length:'35〜80mm', rarity:'common', world:1,
    description:'日本最大のバッタ。細長い体と顔が特徴で、跳躍力が高く草原を素早く移動する。',
    imagePath:'/assets/insects/c08.jpg', bgColor:'#ecfccb' },

  { id:'c09', name:'ナナフシ', nameEn:'Phraortes elongatus',
    origin:'日本', length:'70〜130mm', rarity:'common', world:1,
    description:'木の枝そっくりの体型で擬態する昆虫。「七節」と書き、節の多い体が名前の由来。',
    imagePath:'/assets/insects/c09.jpg', bgColor:'#d1fae5' },

  { id:'c10', name:'オニヤンマ', nameEn:'Anotogaster sieboldii',
    origin:'日本', length:'90〜110mm', rarity:'common', world:1,
    description:'日本最大のトンボ。時速70kmで飛翔し、ハチやアブも捕食する。渓流沿いに生息する。',
    imagePath:'/assets/insects/c10.jpg', bgColor:'#cffafe' },

  { id:'c11', name:'アキアカネ', nameEn:'Sympetrum frequens',
    origin:'日本', length:'35〜45mm', rarity:'common', world:1,
    description:'秋の日本を代表する赤いトンボ。夏は涼しい山地で過ごし、秋になると平地に降りてくる。',
    imagePath:'/assets/insects/c11.jpg', bgColor:'#fee2e2' },

  { id:'c12', name:'モンシロチョウ', nameEn:'Pieris rapae',
    origin:'日本', length:'40〜60mm', rarity:'common', world:1,
    description:'日本で最もよく見られるチョウ。白い羽に黒い紋が入り、キャベツ畑でよく見かける。',
    imagePath:'/assets/insects/c12.jpg', bgColor:'#f0fdf4' },

  { id:'c13', name:'アゲハチョウ', nameEn:'Papilio xuthus',
    origin:'日本', length:'50〜75mm', rarity:'common', world:1,
    description:'日本の代表的なアゲハチョウ。黄色と黒の縞模様が美しく、柑橘類の葉に産卵する。',
    imagePath:'/assets/insects/c13.jpg', bgColor:'#fef9c3' },

  { id:'c14', name:'ニホンミツバチ', nameEn:'Apis cerana japonica',
    origin:'日本', length:'10〜13mm', rarity:'common', world:1,
    description:'日本固有のミツバチ。西洋ミツバチと違い、スズメバチを熱球で撃退する知恵を持つ。',
    imagePath:'/assets/insects/c14.jpg', bgColor:'#fef3c7' },

  { id:'c15', name:'アブラゼミ', nameEn:'Graptopsaltria nigrofuscata',
    origin:'日本', length:'55〜62mm', rarity:'common', world:1,
    description:'日本で最もよく見られるセミ。茶色い不透明な翅が特徴で、夏の夕暮れに大合唱する。',
    imagePath:'/assets/insects/c15.jpg', bgColor:'#fef3c7' },

  { id:'c16', name:'クロアゲハ', nameEn:'Papilio protenor',
    origin:'日本', length:'70〜100mm', rarity:'common', world:1,
    description:'全身が黒いアゲハチョウ。光に当たると青紫に光る後翅が美しい。山地の林道でよく見られる。',
    imagePath:'/assets/insects/c16.jpg', bgColor:'#292524', labelColor:'#fff' },

  { id:'c17', name:'シオカラトンボ', nameEn:'Orthetrum albistylum',
    origin:'日本', length:'48〜56mm', rarity:'common', world:1,
    description:'水辺に生息する代表的なトンボ。成熟したオスは青白い体色になる。夏の田んぼで多く見られる。',
    imagePath:'/assets/insects/c17.jpg', bgColor:'#e0f2fe' },

  { id:'c18', name:'オオスズメバチ', nameEn:'Vespa mandarinia',
    origin:'日本', length:'27〜45mm', rarity:'common', world:1,
    description:'世界最大のスズメバチ。強力な毒と顎で他の昆虫を捕食する。日本では注意が必要な昆虫のひとつ。',
    imagePath:'/assets/insects/c18.jpg', bgColor:'#fef3c7' },

  { id:'c19', name:'ゲンゴロウ', nameEn:'Cybister chinensis',
    origin:'日本', length:'34〜42mm', rarity:'common', world:1,
    description:'水中を颯爽と泳ぐ日本最大の水生甲虫。かつては全国の池や田んぼに多く生息したが、今は希少。',
    imagePath:'/assets/insects/c19.jpg', bgColor:'#166534', labelColor:'#fff' },

  { id:'c20', name:'ミンミンゼミ', nameEn:'Hyalessa maculaticollis',
    origin:'日本', length:'50〜60mm', rarity:'common', world:1,
    description:'日本のセミの中で最も大きな声で鳴く。透明な翅に緑の斑紋があり、夏の風物詩。',
    imagePath:'/assets/insects/c20.jpg', bgColor:'#dcfce7' },

  { id:'c21', name:'モンキチョウ', nameEn:'Colias erate',
    origin:'日本', length:'40〜52mm', rarity:'common', world:1,
    description:'黄色い翅に黒い紋模様を持つ身近なチョウ。草原や農地に生息し、クローバーの花を好む。',
    imagePath:'/assets/insects/c21.jpg', bgColor:'#fef9c3' },

  { id:'c22', name:'エンマコオロギ', nameEn:'Teleogryllus emma',
    origin:'日本', length:'30〜40mm', rarity:'common', world:1,
    description:'秋の夜に「コロコロ」と鳴く日本最大のコオロギ。古くから鳴き声が愛でられてきた。',
    imagePath:'/assets/insects/c22.jpg', bgColor:'#292524', labelColor:'#fff' },

  { id:'c23', name:'ヤマトシジミ', nameEn:'Pseudozizeeria maha',
    origin:'日本', length:'20〜30mm', rarity:'common', world:1,
    description:'日本で最も身近な小型のチョウ。カタバミの葉を食草とし、街中の空き地でもよく見られる。',
    imagePath:'/assets/insects/c23.jpg', bgColor:'#dbeafe' },

  { id:'c24', name:'ルリタテハ', nameEn:'Kaniska canace',
    origin:'日本', length:'50〜65mm', rarity:'common', world:1,
    description:'茶色の翅に鮮やかな青紫の帯が走るタテハチョウ。翅の裏が枯れ葉に擬態している。',
    imagePath:'/assets/insects/c24.jpg', bgColor:'#dbeafe' },
];

export function rollGacha() {
  const rand = Math.random() * 100;
  let rarity;
  if (rand < 0.5)      rarity = 'legend';
  else if (rand < 3.5) rarity = 'ultra';
  else if (rand < 15.5) rarity = 'superRare';
  else if (rand < 40.5) rarity = 'rare';
  else                  rarity = 'common';
  const pool = INSECTS.filter(i => i.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}
