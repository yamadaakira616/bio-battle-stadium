export const DUPLICATE_COINS = 30;

const B = import.meta.env.BASE_URL;

export const SERIES = [
  { id: 'normal',      label: 'ノーマル',       rate: 73 },
  { id: 'bonbon-drop', label: 'ボンボンドロップ', rate: 10 },
  { id: 'marshmallow', label: 'マシュマロ',       rate: 8  },
  { id: 'shaka-shaka', label: 'シャカシャカ',     rate: 5  },
  { id: 'water-seal',  label: 'ウォーター',       rate: 2  },
  { id: 'oshiri',      label: 'おしりシール',     rate: 1  },
  { id: 'special',     label: 'スペシャル',       rate: 1  },
];

export const STICKERS = [
  // ===== シャカシャカシール (8枚) =====
  { id:'ss-ame-chan',    name:'あめちゃん',     series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ame-chan.png' },
  { id:'ss-kagu-chan',   name:'かぐちゃん',     series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/kagu-chan.png' },
  { id:'ss-gakki-chan',  name:'がっきちゃん',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/gakki-chan.png' },
  { id:'ss-hoshi-chan',  name:'ほしちゃん',     series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/hoshi-chan.png' },
  { id:'ss-usagi-chan',  name:'うさぎちゃん',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/usagi-chan.png' },
  { id:'ss-neko-chan',   name:'ねこちゃん',     series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/neko-chan.png' },
  { id:'ss-obake-chan',  name:'おばけちゃん',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/obake-chan.png' },
  { id:'ss-kumo-chan',   name:'くもちゃん',     series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/kumo-chan.png' },

  // ===== ウォーターシール (8枚) =====
  { id:'ws-usagi-chan',   name:'うさぎちゃん',   series:'water-seal', imagePath:B+'assets/water-seal/usagi-chan.png' },
  { id:'ws-neko-chan',    name:'ねこちゃん',     series:'water-seal', imagePath:B+'assets/water-seal/neko-chan.png' },
  { id:'ws-inu-kun',     name:'いぬくん',       series:'water-seal', imagePath:B+'assets/water-seal/inu-kun.png' },
  { id:'ws-kaeru-san',   name:'かえるさん',     series:'water-seal', imagePath:B+'assets/water-seal/kaeru-san.png' },
  { id:'ws-kuma-chan',   name:'くまちゃん',     series:'water-seal', imagePath:B+'assets/water-seal/kuma-chan.png' },
  { id:'ws-panda-chan',  name:'パンダちゃん',   series:'water-seal', imagePath:B+'assets/water-seal/panda-chan.png' },
  { id:'ws-hiyoko-chan', name:'ひよこちゃん',   series:'water-seal', imagePath:B+'assets/water-seal/hiyoko-chan.png' },
  { id:'ws-penguin-kun', name:'ペンギンくん',   series:'water-seal', imagePath:B+'assets/water-seal/penguin-kun.png' },

  // ===== ウォーターシール 追加分 (妖怪 4枚) =====
  { id:'ws-oni-yokai',      name:'おにのこども', series:'water-seal', imagePath:B+'assets/water-seal/oni-yokai.png' },
  { id:'ws-kappa-yokai',    name:'かわどんぐり', series:'water-seal', imagePath:B+'assets/water-seal/kappa-yokai.png' },
  { id:'ws-karakasa-yokai', name:'かさのおばけ', series:'water-seal', imagePath:B+'assets/water-seal/karakasa-yokai.png' },
  { id:'ws-tanuki-yokai',   name:'たぬき',       series:'water-seal', imagePath:B+'assets/water-seal/tanuki-yokai.png' },

  // ===== マシュマロシール (8枚) =====
  { id:'mm-cream-soda',  name:'クリームソーダちゃん', series:'marshmallow', imagePath:B+'assets/marshmallow/cream-soda-chan.png' },
  { id:'mm-shortcake',   name:'ショートケーキちゃん', series:'marshmallow', imagePath:B+'assets/marshmallow/shortcake-chan.png' },
  { id:'mm-obake',       name:'おばけちゃん',         series:'marshmallow', imagePath:B+'assets/marshmallow/obake-chan.png' },
  { id:'mm-moon-wand',   name:'ムーンワンド',          series:'marshmallow', imagePath:B+'assets/marshmallow/moon-wand.png' },
  { id:'mm-kuma',        name:'くまちゃん',            series:'marshmallow', imagePath:B+'assets/marshmallow/kuma-chan.png' },
  { id:'mm-neko',        name:'ねこちゃん',            series:'marshmallow', imagePath:B+'assets/marshmallow/neko-chan.png' },
  { id:'mm-inu',         name:'いぬくん',              series:'marshmallow', imagePath:B+'assets/marshmallow/inu-kun.png' },
  { id:'mm-kaeru',       name:'かえるさん',            series:'marshmallow', imagePath:B+'assets/marshmallow/kaeru-san.png' },

  // ===== ボンボンドロップ (16枚) =====
  { id:'bd-chirpy',      name:'カナリア',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/chirpy-the-canary.png' },
  { id:'bd-bubby',       name:'うさぎ',             series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bubby-the-bunny.png' },
  { id:'bd-paddle',      name:'アヒル',             series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/paddle-the-duck.png' },
  { id:'bd-barnby',      name:'くま',               series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/barnby-the-bear.png' },
  { id:'bd-usagi',       name:'うさぎちゃん',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/usagi-chan.png' },
  { id:'bd-neko',        name:'ねこちゃん',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/neko-chan.png' },
  { id:'bd-inu',         name:'いぬくん',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/inu-kun.png' },
  { id:'bd-kaeru',       name:'かえるさん',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/kaeru-san.png' },
  { id:'bd-toasty',      name:'トースター',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/toasty-the-retro-toaster.png' },
  { id:'bd-chilly',      name:'れいぞうこ',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/chilly-the-vintage-fridge.png' },
  { id:'bd-brewster',    name:'コーヒーメーカー',   series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/brewster-the-coffee-maker.png' },
  { id:'bd-beatie',      name:'ハンドミキサー',     series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/beatie-the-hand-mixer.png' },
  { id:'bd-crystal',     name:'クリスタル',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/cosmic-crystal.png' },
  { id:'bd-mushroom',    name:'スペースきのこ',     series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/space-mushroom.png' },
  { id:'bd-magic-book',  name:'まほうの本',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/magic-book.png' },
  { id:'bd-ghost',       name:'ぎゃらくしーおばけ', series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/galaxy-ghost.png' },

  // ===== ボンボンドロップ 追加分 (妖怪コレクション 8枚) =====
  { id:'bd-kappa-yokai',    name:'カッパ',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-kappa-yokai.png' },
  { id:'bd-kitsune-yokai',  name:'キツネ',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-kitsune-yokai.png' },
  { id:'bd-tanuki-yokai',   name:'タヌキ',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-tanuki-yokai.png' },
  { id:'bd-tengu-yokai',    name:'テング',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-tengu-yokai.png' },
  { id:'bd-oni-yokai',      name:'オニ',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-oni-yokai.png' },
  { id:'bd-yurei-yokai',    name:'ユーレイ',     series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-yurei-yokai.png' },
  { id:'bd-karakasa-yokai', name:'からかさこぞう', series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-karakasa-yokai.png' },
  { id:'bd-nuppeppo-yokai', name:'ぬっぺぽ',     series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-nuppeppo-yokai.png' },

  // ===== ノーマル (32枚) =====
  { id:'nm-koala',         name:'コスミックコアラ',       series:'normal', imagePath:B+'assets/normal/kip-the-cosmic-koala.png' },
  { id:'nm-mushroom-fairy',name:'きのこのようせい',        series:'normal', imagePath:B+'assets/normal/lumina-the-mushroom-fairy.png' },
  { id:'nm-otter',         name:'ネイビーオッター',        series:'normal', imagePath:B+'assets/normal/paddle-the-navy-otter.png' },
  { id:'nm-tulip-elf',     name:'チューリップエルフ',      series:'normal', imagePath:B+'assets/normal/tilly-the-tulip-elf.png' },
  { id:'nm-axolotl',       name:'コスミックアホロートル',  series:'normal', imagePath:B+'assets/normal/kipo-the-cosmic-axolotl.png' },
  { id:'nm-jungle-frog',   name:'ジャングルフロッグ',      series:'normal', imagePath:B+'assets/normal/poppy-the-jungle-frog.png' },
  { id:'nm-mushroom-f2',   name:'きのこのようせい２',      series:'normal', imagePath:B+'assets/normal/lumina-the-mushroom-fairy-2.png' },
  { id:'nm-tea-elf',       name:'ティーエルフ',            series:'normal', imagePath:B+'assets/normal/tilly-the-tea-elf.png' },
  { id:'nm-treant',        name:'ちいさなトレント',        series:'normal', imagePath:B+'assets/normal/oakley-the-tiny-treant.png' },
  { id:'nm-fox',           name:'きつねパイロット',        series:'normal', imagePath:B+'assets/normal/finnegan-the-fox-aviator.png' },
  { id:'nm-nebula-cat',    name:'ネビュラキティン',        series:'normal', imagePath:B+'assets/normal/spark-the-nebula-kitten.png' },
  { id:'nm-tulip-elf2',    name:'チューリップエルフ２',    series:'normal', imagePath:B+'assets/normal/tilly-the-tulip-elf-2.png' },
  { id:'nm-void-cat',      name:'ブラックキャット',        series:'normal', imagePath:B+'assets/normal/pixel-the-void-kitten.png' },
  { id:'nm-snow-owl',      name:'スノーフクロウ',          series:'normal', imagePath:B+'assets/normal/kipo-the-snow-owl.png' },
  { id:'nm-tea-elf2',      name:'ティーエルフ２',          series:'normal', imagePath:B+'assets/normal/brewster-the-tea-elf.png' },
  { id:'nm-tulip-elf3',    name:'チューリップエルフ３',    series:'normal', imagePath:B+'assets/normal/tilly-the-tulip-elf-3.png' },
  { id:'nm-eye-monster',   name:'アイモンスター',          series:'normal', imagePath:B+'assets/normal/eye-monster.png' },
  { id:'nm-slime',         name:'スライム',                series:'normal', imagePath:B+'assets/normal/slime-crawler.png' },
  { id:'nm-dog-burst',     name:'ドッグバースト',          series:'normal', imagePath:B+'assets/normal/dog-burst.png' },
  { id:'nm-zombie',        name:'ゾンビゼリー',            series:'normal', imagePath:B+'assets/normal/zombie-jelly.png' },
  { id:'nm-slime-ghost',   name:'スライムクリーチャー',    series:'normal', imagePath:B+'assets/normal/gloop-the-slime-creature.png' },
  { id:'nm-dust-mite',     name:'ダストマイト',            series:'normal', imagePath:B+'assets/normal/scritch-the-dust-mite.png' },
  { id:'nm-rotten-fruit',  name:'くさったフルーツ',        series:'normal', imagePath:B+'assets/normal/splat-the-rotting-fruit.png' },
  { id:'nm-spider-elf',    name:'スパイダーエルフ',        series:'normal', imagePath:B+'assets/normal/boo-the-spooky-spider-elf.png' },
  { id:'nm-duck',          name:'アヒル',                  series:'normal', imagePath:B+'assets/normal/paddle-the-duck.png' },
  { id:'nm-bear',          name:'くま',                    series:'normal', imagePath:B+'assets/normal/barnby-the-bear.png' },
  { id:'nm-canary',        name:'カナリア',                series:'normal', imagePath:B+'assets/normal/chirpy-the-canary.png' },
  { id:'nm-bunny',         name:'うさぎ',                  series:'normal', imagePath:B+'assets/normal/bubby-the-bunny.png' },
  { id:'nm-canary2',       name:'カナリア２',              series:'normal', imagePath:B+'assets/normal/chirpy-the-canary-2.png' },
  { id:'nm-panda',         name:'パンダペインター',        series:'normal', imagePath:B+'assets/normal/poppy-the-panda-painter.png' },
  { id:'nm-bear2',         name:'くま２',                  series:'normal', imagePath:B+'assets/normal/barnby-the-bear-2.png' },
  { id:'nm-jungle-frog2',  name:'ジャングルフロッグ２',    series:'normal', imagePath:B+'assets/normal/kipo-the-jungle-frog.png' },

  // ===== ノーマル 追加分 (12枚) =====
  { id:'nm-sweet-treats',    name:'スウィーツパック',        series:'normal', imagePath:B+'assets/normal/sweet-treats.png' },
  { id:'nm-fantasy-dreams',  name:'ファンタジードリームス',  series:'normal', imagePath:B+'assets/normal/fantasy-dreams.png' },
  { id:'nm-beauty-fashion',  name:'ビューティー＆ファッション', series:'normal', imagePath:B+'assets/normal/beauty-fashion.png' },
  { id:'nm-flower-garden',   name:'フラワーガーデン',        series:'normal', imagePath:B+'assets/normal/flower-garden.png' },
  { id:'nm-cake-chef',       name:'ケーキちゃん',            series:'normal', imagePath:B+'assets/normal/cake-chef.png' },
  { id:'nm-pudding',         name:'プリンちゃん',            series:'normal', imagePath:B+'assets/normal/pudding.png' },
  { id:'nm-donut',           name:'ドーナツちゃん',          series:'normal', imagePath:B+'assets/normal/donut.png' },
  { id:'nm-ice-cream-sundae',name:'パフェちゃん',            series:'normal', imagePath:B+'assets/normal/ice-cream-sundae.png' },
  { id:'nm-sweet-dreams',    name:'スウィートドリームス',    series:'normal', imagePath:B+'assets/normal/sweet-dreams.png' },
  { id:'nm-tea-party',       name:'ティーパーティー',        series:'normal', imagePath:B+'assets/normal/tea-party.png' },
  { id:'nm-magical-parade',  name:'マジカルパレード',        series:'normal', imagePath:B+'assets/normal/magical-parade.png' },
  { id:'nm-garden-charm',    name:'ガーデンチャーム',        series:'normal', imagePath:B+'assets/normal/garden-charm.png' },

  // ===== ノーマル 追加分2 (珍しい動物・妖怪・昆虫 各4枚) =====
  { id:'nm-quokka',       name:'クオッカ',         series:'normal', imagePath:B+'assets/normal/nm-quokka.png' },
  { id:'nm-mendako',      name:'メンダコ',         series:'normal', imagePath:B+'assets/normal/nm-mendako.png' },
  { id:'nm-shoebill',     name:'ハシビロコウ',     series:'normal', imagePath:B+'assets/normal/nm-shoebill.png' },
  { id:'nm-axolotl',      name:'アホロートル',     series:'normal', imagePath:B+'assets/normal/nm-axolotl.png' },
  { id:'nm-kappa',        name:'カッパ',           series:'normal', imagePath:B+'assets/normal/nm-kappa.png' },
  { id:'nm-karakasa',     name:'からかさ',         series:'normal', imagePath:B+'assets/normal/nm-karakasa.png' },
  { id:'nm-kitsune',      name:'きつね',           series:'normal', imagePath:B+'assets/normal/nm-kitsune.png' },
  { id:'nm-yuki-onna',    name:'ゆきおんな',       series:'normal', imagePath:B+'assets/normal/nm-yuki-onna.png' },
  { id:'nm-stag-beetle',  name:'クワガタ',         series:'normal', imagePath:B+'assets/normal/nm-stag-beetle.png' },
  { id:'nm-butterfly',    name:'チョウ',           series:'normal', imagePath:B+'assets/normal/nm-butterfly.png' },
  { id:'nm-dragonfly',    name:'トンボ',           series:'normal', imagePath:B+'assets/normal/nm-dragonfly.png' },
  { id:'nm-ladybug',      name:'てんとうむし',     series:'normal', imagePath:B+'assets/normal/nm-ladybug.png' },

  // ===== おしりシール (4枚) =====
  { id:'os-shiba',   name:'柴犬のお尻',       series:'oshiri', imagePath:B+'assets/oshiri/shiba-oshiri.png' },
  { id:'os-mike',    name:'三毛尻シール',     series:'oshiri', imagePath:B+'assets/oshiri/mike-oshiri.png' },
  { id:'os-usagi',   name:'うさぎのもちもち', series:'oshiri', imagePath:B+'assets/oshiri/usagi-oshiri.png' },
  { id:'os-penguin', name:'ペンギンのぽてっと',series:'oshiri', imagePath:B+'assets/oshiri/penguin-oshiri.png' },

  // ===== おしりシール 追加分 (4枚) =====
  { id:'os-axolotl',  name:'アホロートルのぷにぷに', series:'oshiri', imagePath:B+'assets/oshiri/axolotl-oshiri.png' },
  { id:'os-pangolin', name:'センザンコウのうろこ',   series:'oshiri', imagePath:B+'assets/oshiri/pangolin-oshiri.png' },
  { id:'os-kiwi',     name:'キウイのお尻',           series:'oshiri', imagePath:B+'assets/oshiri/kiwi-oshiri.png' },
  { id:'os-kakapo',   name:'カカポのぷにぷに',       series:'oshiri', imagePath:B+'assets/oshiri/kakapo-oshiri.png' },

  // ===== スペシャル (12枚) =====
  { id:'sp-velvet-bunny',  name:'ベルベットうさぎ',   series:'special', imagePath:B+'assets/special/velvet-bunny.png' },
  { id:'sp-velvet-bear',   name:'ベルベットくま',     series:'special', imagePath:B+'assets/special/velvet-bear.png' },
  { id:'sp-velvet-cat',    name:'ベルベットねこ',     series:'special', imagePath:B+'assets/special/velvet-cat.png' },
  { id:'sp-velvet-paw',    name:'ベルベットにくきゅう', series:'special', imagePath:B+'assets/special/velvet-paw.png' },
  { id:'sp-royal-rabbit',  name:'ロイヤルうさぎ',     series:'special', imagePath:B+'assets/special/royal-rabbit.png' },
  { id:'sp-heraldry-bear', name:'ヘラルドリーくま',   series:'special', imagePath:B+'assets/special/heraldry-bear.png' },
  { id:'sp-gem-cat',       name:'ジェムキャット',     series:'special', imagePath:B+'assets/special/gem-cat.png' },
  { id:'sp-royal-paw',     name:'ロイヤルにくきゅう', series:'special', imagePath:B+'assets/special/royal-paw.png' },
  { id:'sp-puni-animals',  name:'プニプニどうぶつ',   series:'special', imagePath:B+'assets/special/puni-animals.png' },
  { id:'sp-puni-food',     name:'プニプニたべもの',   series:'special', imagePath:B+'assets/special/puni-food.png' },
  { id:'sp-puni-vehicles', name:'プニプニのりもの',   series:'special', imagePath:B+'assets/special/puni-vehicles.png' },
  { id:'sp-puni-creatures',name:'プニプニいきもの',   series:'special', imagePath:B+'assets/special/puni-creatures.png' },
];

export function rollGacha() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  let selectedSeries = 'normal';
  for (const s of SERIES) {
    cumulative += s.rate;
    if (rand < cumulative) { selectedSeries = s.id; break; }
  }
  const pool = STICKERS.filter(s => s.series === selectedSeries);
  return pool[Math.floor(Math.random() * pool.length)];
}
