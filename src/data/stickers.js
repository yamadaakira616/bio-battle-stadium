export const DUPLICATE_COINS = 30;
export const LEGENDARY_DUPLICATE_COINS = 150;

const B = import.meta.env.BASE_URL;

export const SERIES = [
  { id: 'bio',    label: '生物',     rate: 58 },
  { id: 'arms',   label: '武器',     rate: 25 },
  { id: 'armbio', label: '武装生物', rate: 10 },
  { id: 'corps',  label: '軍団',     rate: 5  },
  { id: 'catsle', label: '城主',     rate: 2  },
];

// Legendary内のシリーズ配分（合計100%）
const LEGENDARY_SERIES = [
  { id: 'legendary-bio',    label: '伝説の生物',     rate: 35 },
  { id: 'legendary-arms',   label: '伝説の武器',     rate: 25 },
  { id: 'legendary-armbio', label: '伝説の武装生物', rate: 20 },
  { id: 'legendary-corps',  label: '伝説の軍団',     rate: 12 },
  { id: 'legendary-catsle', label: '伝説の城主',     rate: 8  },
];

export const STICKERS = [
  // ===== 生物 (32枚) =====
  { id:'bio-migratory-locust',            name:'Migratory Locust',                series:'bio',    imagePath:B+'assets/gacha/bio/migratory-locust.png' },
  { id:'bio-oriental-long-headed-locust', name:'Oriental Long-Headed Locust',     series:'bio',    imagePath:B+'assets/gacha/bio/oriental-long-headed-locust.png' },
  { id:'bio-two-striped-grasshopper',     name:'Two-Striped Grasshopper',         series:'bio',    imagePath:B+'assets/gacha/bio/two-striped-grasshopper.png' },
  { id:'bio-kubinaga-grasshopper',        name:'Kubinaga Grasshopper',            series:'bio',    imagePath:B+'assets/gacha/bio/kubinaga-grasshopper.png' },
  { id:'bio-african-elephant',            name:'African Elephant',                series:'bio',    imagePath:B+'assets/gacha/bio/african-elephant.png' },
  { id:'bio-reticulated-giraffe',         name:'Reticulated Giraffe',             series:'bio',    imagePath:B+'assets/gacha/bio/reticulated-giraffe.png' },
  { id:'bio-white-rhinoceros',            name:'White Rhinoceros',                series:'bio',    imagePath:B+'assets/gacha/bio/white-rhinoceros.png' },
  { id:'bio-plains-zebra',                name:'Plains Zebra',                    series:'bio',    imagePath:B+'assets/gacha/bio/plains-zebra.png' },
  { id:'bio-hercules-beetle',             name:'Hercules Beetle',                 series:'bio',    imagePath:B+'assets/gacha/bio/hercules-beetle.png' },
  { id:'bio-neptune-beetle',              name:'Neptune Beetle',                  series:'bio',    imagePath:B+'assets/gacha/bio/neptune-beetle.png' },
  { id:'bio-elephant-beetle',             name:'Elephant Beetle',                 series:'bio',    imagePath:B+'assets/gacha/bio/elephant-beetle.png' },
  { id:'bio-atlas-beetle',                name:'Atlas Beetle',                    series:'bio',    imagePath:B+'assets/gacha/bio/atlas-beetle.png' },
  { id:'bio-tyrannosaurus-rex',           name:'Tyrannosaurus Rex',               series:'bio',    imagePath:B+'assets/gacha/bio/tyrannosaurus-rex.png' },
  { id:'bio-velociraptor',                name:'Velociraptor',                    series:'bio',    imagePath:B+'assets/gacha/bio/velociraptor.png' },
  { id:'bio-spinosaurus',                 name:'Spinosaurus',                     series:'bio',    imagePath:B+'assets/gacha/bio/spinosaurus.png' },
  { id:'bio-allosaurus',                  name:'Allosaurus',                      series:'bio',    imagePath:B+'assets/gacha/bio/allosaurus.png' },
  { id:'bio-african-lion',                name:'African Lion',                    series:'bio',    imagePath:B+'assets/gacha/bio/african-lion.png' },
  { id:'bio-siberian-tiger',              name:'Siberian Tiger',                  series:'bio',    imagePath:B+'assets/gacha/bio/siberian-tiger.png' },
  { id:'bio-grey-wolf',                   name:'Grey Wolf',                       series:'bio',    imagePath:B+'assets/gacha/bio/grey-wolf.png' },
  { id:'bio-grizzly-bear',                name:'Grizzly Bear',                    series:'bio',    imagePath:B+'assets/gacha/bio/grizzly-bear.png' },
  { id:'bio-giant-stag-beetle',           name:'Giant Stag Beetle',               series:'bio',    imagePath:B+'assets/gacha/bio/giant-stag-beetle.png' },
  { id:'bio-giraffe-stag-beetle',         name:'Giraffe Stag Beetle',             series:'bio',    imagePath:B+'assets/gacha/bio/giraffe-stag-beetle.png' },
  { id:'bio-rainbow-stag-beetle',         name:'Rainbow Stag Beetle',             series:'bio',    imagePath:B+'assets/gacha/bio/rainbow-stag-beetle.png' },
  { id:'bio-siva-stag-beetle',            name:'Siva Stag Beetle',                series:'bio',    imagePath:B+'assets/gacha/bio/siva-stag-beetle.png' },
  { id:'bio-triceratops',                 name:'Triceratops',                     series:'bio',    imagePath:B+'assets/gacha/bio/triceratops.png' },
  { id:'bio-brachiosaurus',               name:'Brachiosaurus',                   series:'bio',    imagePath:B+'assets/gacha/bio/brachiosaurus.png' },
  { id:'bio-stegosaurus',                 name:'Stegosaurus',                     series:'bio',    imagePath:B+'assets/gacha/bio/stegosaurus.png' },
  { id:'bio-parasaurolophus',             name:'Parasaurolophus',                 series:'bio',    imagePath:B+'assets/gacha/bio/parasaurolophus.png' },
  { id:'bio-japanese-giant-mantis',       name:'Japanese Giant Mantis',           series:'bio',    imagePath:B+'assets/gacha/bio/japanese-giant-mantis.png' },
  { id:'bio-orchid-mantis',               name:'Orchid Mantis',                   series:'bio',    imagePath:B+'assets/gacha/bio/orchid-mantis.png' },
  { id:'bio-dead-leaf-mantis',            name:'Dead Leaf Mantis',                series:'bio',    imagePath:B+'assets/gacha/bio/dead-leaf-mantis.png' },
  { id:'bio-devils-flower-mantis',        name:"Devil's Flower Mantis",           series:'bio',    imagePath:B+'assets/gacha/bio/devils-flower-mantis.png' },

  // ===== 武器 (24枚) =====
  { id:'arm-japanese-yumi-bow',              name:'Japanese Yumi Bow',                   series:'arms',   imagePath:B+'assets/gacha/arms/japanese-yumi-bow.png' },
  { id:'arm-english-longbow',                name:'English Longbow',                     series:'arms',   imagePath:B+'assets/gacha/arms/english-longbow.png' },
  { id:'arm-mongolian-horsebow',             name:'Mongolian Horsebow',                  series:'arms',   imagePath:B+'assets/gacha/arms/mongolian-horsebow.png' },
  { id:'arm-medieval-crossbow',              name:'Medieval Crossbow',                   series:'arms',   imagePath:B+'assets/gacha/arms/medieval-crossbow.png' },
  { id:'arm-katana',                         name:'Katana',                              series:'arms',   imagePath:B+'assets/gacha/arms/katana.png' },
  { id:'arm-scottish-claymore',              name:'Scottish Claymore',                   series:'arms',   imagePath:B+'assets/gacha/arms/scottish-claymore.png' },
  { id:'arm-yatagan-sword',                  name:'Yatagan Sword',                       series:'arms',   imagePath:B+'assets/gacha/arms/yatagan-sword.png' },
  { id:'arm-cavalry-saber',                  name:'Cavalry Saber',                       series:'arms',   imagePath:B+'assets/gacha/arms/cavalry-saber.png' },
  { id:'arm-plasma-beam-rifle',              name:'Plasma Beam Rifle',                   series:'arms',   imagePath:B+'assets/gacha/arms/plasma-beam-rifle.png' },
  { id:'arm-elven-starlight-sword',          name:'Elven Starlight Sword',               series:'arms',   imagePath:B+'assets/gacha/arms/elven-starlight-sword.png' },
  { id:'arm-mechanical-steam-gauntlet',      name:'Mechanical Steam Gauntlet',           series:'arms',   imagePath:B+'assets/gacha/arms/mechanical-steam-gauntlet.png' },
  { id:'arm-fusion-energy-launcher',         name:'Fusion Energy Launcher',              series:'arms',   imagePath:B+'assets/gacha/arms/fusion-energy-launcher.png' },
  { id:'arm-fgm148-javelin',                 name:'FGM-148 Javelin',                     series:'arms',   imagePath:B+'assets/gacha/arms/fgm148-javelin.png' },
  { id:'arm-rpg7-multi-purpose-weapon',      name:'RPG-7 Multi-Purpose Weapon',          series:'arms',   imagePath:B+'assets/gacha/arms/rpg7-multi-purpose-weapon.png' },
  { id:'arm-fim92-stinger-manpads',          name:'FIM-92 Stinger MANPADS',              series:'arms',   imagePath:B+'assets/gacha/arms/fim92-stinger-manpads.png' },
  { id:'arm-m32a1-grenade-launcher',         name:'M32A1 Grenade Launcher',              series:'arms',   imagePath:B+'assets/gacha/arms/m32a1-grenade-launcher.png' },
  { id:'arm-mobile-siege-fortress',          name:'Mobile Siege Fortress',               series:'arms',   imagePath:B+'assets/gacha/arms/mobile-siege-fortress.png' },
  { id:'arm-orbital-judgment-satellite',     name:'Orbital Judgment Satellite',          series:'arms',   imagePath:B+'assets/gacha/arms/orbital-judgment-satellite.png' },
  { id:'arm-gigantic-walking-dreadnought',   name:'Gigantic Walking Dreadnought',        series:'arms',   imagePath:B+'assets/gacha/arms/gigantic-walking-dreadnought.png' },
  { id:'arm-aerial-domination-super-fortress',name:'Aerial Domination Super-Fortress',   series:'arms',   imagePath:B+'assets/gacha/arms/aerial-domination-super-fortress.png' },
  { id:'arm-colossal-antimatter-annihilator',name:'Colossal Antimatter Annihilator',     series:'arms',   imagePath:B+'assets/gacha/arms/colossal-antimatter-annihilator.png' },
  { id:'arm-divine-celestial-greatsword',    name:'Divine Celestial Greatsword',         series:'arms',   imagePath:B+'assets/gacha/arms/divine-celestial-greatsword.png' },
  { id:'arm-exosuit-particle-cannon-gauntlet',name:'Exosuit Particle Cannon Gauntlet',   series:'arms',   imagePath:B+'assets/gacha/arms/exosuit-particle-cannon-gauntlet.png' },
  { id:'arm-ultimate-cosmic-staff',          name:'Ultimate Cosmic Staff',               series:'arms',   imagePath:B+'assets/gacha/arms/ultimate-cosmic-staff.png' },

  // ===== 武装生物 (16枚) =====
  { id:'ab-titanus-with-gatling',       name:'Titanus with Gatling',        series:'armbio', imagePath:B+'assets/gacha/armbio/titanus-with-gatling.png' },
  { id:'ab-titanus-with-rockets',       name:'Titanus with Rockets',        series:'armbio', imagePath:B+'assets/gacha/armbio/titanus-with-rockets.png' },
  { id:'ab-titanus-with-plasma-cannon', name:'Titanus with Plasma Cannon',  series:'armbio', imagePath:B+'assets/gacha/armbio/titanus-with-plasma-cannon.png' },
  { id:'ab-titanus-with-swarm-launcher',name:'Titanus with Swarm Launcher', series:'armbio', imagePath:B+'assets/gacha/armbio/titanus-with-swarm-launcher.png' },
  { id:'ab-trex-artillery-side',        name:'T-Rex Artillery (Side)',      series:'armbio', imagePath:B+'assets/gacha/armbio/trex-artillery-side.png' },
  { id:'ab-trex-artillery-front',       name:'T-Rex Artillery (Front)',     series:'armbio', imagePath:B+'assets/gacha/armbio/trex-artillery-front.png' },
  { id:'ab-trex-artillery-rear',        name:'T-Rex Artillery (Rear)',      series:'armbio', imagePath:B+'assets/gacha/armbio/trex-artillery-rear.png' },
  { id:'ab-trex-artillery-sitting',     name:'T-Rex Artillery (Sitting)',   series:'armbio', imagePath:B+'assets/gacha/armbio/trex-artillery-sitting.png' },
  { id:'ab-elephant-with-laser',        name:'Elephant with Laser',         series:'armbio', imagePath:B+'assets/gacha/armbio/elephant-with-laser.png' },
  { id:'ab-elephant-with-rockets',      name:'Elephant with Rockets',       series:'armbio', imagePath:B+'assets/gacha/armbio/elephant-with-rockets.png' },
  { id:'ab-elephant-with-katana',       name:'Elephant with Katana',        series:'armbio', imagePath:B+'assets/gacha/armbio/elephant-with-katana.png' },
  { id:'ab-elephant-with-halberd',      name:'Elephant with Halberd',       series:'armbio', imagePath:B+'assets/gacha/armbio/elephant-with-halberd.png' },
  { id:'ab-mantis-with-gatling',        name:'Mantis with Gatling Gun',     series:'armbio', imagePath:B+'assets/gacha/armbio/mantis-with-gatling.png' },
  { id:'ab-mantis-with-missiles',       name:'Mantis with Missiles',        series:'armbio', imagePath:B+'assets/gacha/armbio/mantis-with-missiles.png' },
  { id:'ab-mantis-with-laser-cannon',   name:'Mantis with Laser Cannon',    series:'armbio', imagePath:B+'assets/gacha/armbio/mantis-with-laser-cannon.png' },
  { id:'ab-mantis-with-emp',            name:'Mantis with EMP Emitter',     series:'armbio', imagePath:B+'assets/gacha/armbio/mantis-with-emp.png' },

  // ===== 軍団 (16枚) =====
  { id:'cor-trex-triceratops-army',                  name:'T-Rex & Triceratops Army',                    series:'corps',  imagePath:B+'assets/gacha/corps/trex-triceratops-army.png' },
  { id:'cor-spinosaurus-stegosaurus-army',            name:'Spinosaurus & Stegosaurus Army',              series:'corps',  imagePath:B+'assets/gacha/corps/spinosaurus-stegosaurus-army.png' },
  { id:'cor-velociraptor-ankylosaurus-legion',        name:'Velociraptor & Ankylosaurus Legion',          series:'corps',  imagePath:B+'assets/gacha/corps/velociraptor-ankylosaurus-legion.png' },
  { id:'cor-brachiosaurus-pachycephalosaurus-squadron',name:'Brachiosaurus & Pachycephalosaurus Squadron', series:'corps',  imagePath:B+'assets/gacha/corps/brachiosaurus-pachycephalosaurus-squadron.png' },
  { id:'cor-lion-hyena-army',                         name:'Lion & Hyena Army',                          series:'corps',  imagePath:B+'assets/gacha/corps/lion-hyena-army.png' },
  { id:'cor-elephant-rhino-army',                     name:'Elephant & Rhino Army',                      series:'corps',  imagePath:B+'assets/gacha/corps/elephant-rhino-army.png' },
  { id:'cor-blue-whale-swordfish-navy',               name:'Blue Whale & Swordfish Navy',                series:'corps',  imagePath:B+'assets/gacha/corps/blue-whale-swordfish-navy.png' },
  { id:'cor-gorilla-mandrill-legion',                 name:'Gorilla & Mandrill Legion',                  series:'corps',  imagePath:B+'assets/gacha/corps/gorilla-mandrill-legion.png' },
  { id:'cor-stag-beetle-army-gold',                   name:'Stag Beetle Army (Gold)',                    series:'corps',  imagePath:B+'assets/gacha/corps/stag-beetle-army-gold.png' },
  { id:'cor-stag-beetle-army-grey',                   name:'Stag Beetle Army (Grey)',                    series:'corps',  imagePath:B+'assets/gacha/corps/stag-beetle-army-grey.png' },
  { id:'cor-stag-beetle-army-brown',                  name:'Stag Beetle Army (Brown)',                   series:'corps',  imagePath:B+'assets/gacha/corps/stag-beetle-army-brown.png' },
  { id:'cor-stag-beetle-army-green',                  name:'Stag Beetle Army (Green)',                   series:'corps',  imagePath:B+'assets/gacha/corps/stag-beetle-army-green.png' },
  { id:'cor-japanese-stag-beetle-ant-army',           name:'Japanese Stag Beetle & Ant Army',            series:'corps',  imagePath:B+'assets/gacha/corps/japanese-stag-beetle-ant-army.png' },
  { id:'cor-asian-wasp-fly-army',                     name:'Asian Giant Wasp & Fly Army',                series:'corps',  imagePath:B+'assets/gacha/corps/asian-wasp-fly-army.png' },
  { id:'cor-mantis-ladybug-legion',                   name:'Mantis & Ladybug Legion',                    series:'corps',  imagePath:B+'assets/gacha/corps/mantis-ladybug-legion.png' },
  { id:'cor-honeybee-mosquito-squadron',              name:'Honey Bee & Mosquito Squadron',              series:'corps',  imagePath:B+'assets/gacha/corps/honeybee-mosquito-squadron.png' },

  // ===== 生物 追加分 (12枚) =====
  { id:'bio-orca',                  name:'Orca',                   series:'bio', imagePath:B+'assets/gacha/bio/orca.png' },
  { id:'bio-lions-mane-jellyfish',  name:'Lion\'s Mane Jellyfish', series:'bio', imagePath:B+'assets/gacha/bio/lions-mane-jellyfish.png' },
  { id:'bio-leafy-seadragon',       name:'Leafy Seadragon',        series:'bio', imagePath:B+'assets/gacha/bio/leafy-seadragon.png' },
  { id:'bio-manatee',               name:'Manatee',                series:'bio', imagePath:B+'assets/gacha/bio/manatee.png' },
  { id:'bio-great-white-shark',     name:'Great White Shark',      series:'bio', imagePath:B+'assets/gacha/bio/great-white-shark.png' },
  { id:'bio-giant-pacific-octopus', name:'Giant Pacific Octopus',  series:'bio', imagePath:B+'assets/gacha/bio/giant-pacific-octopus.png' },
  { id:'bio-long-snouted-seahorse', name:'Long-Snouted Seahorse',  series:'bio', imagePath:B+'assets/gacha/bio/long-snouted-seahorse.png' },
  { id:'bio-green-sea-turtle',      name:'Green Sea Turtle',       series:'bio', imagePath:B+'assets/gacha/bio/green-sea-turtle.png' },
  { id:'bio-harpy-eagle',           name:'Harpy Eagle',            series:'bio', imagePath:B+'assets/gacha/bio/harpy-eagle.png' },
  { id:'bio-secretarybird',         name:'Secretarybird',          series:'bio', imagePath:B+'assets/gacha/bio/secretarybird.png' },
  { id:'bio-southern-cassowary',    name:'Southern Cassowary',     series:'bio', imagePath:B+'assets/gacha/bio/southern-cassowary.png' },
  { id:'bio-golden-eagle',          name:'Golden Eagle',           series:'bio', imagePath:B+'assets/gacha/bio/golden-eagle.png' },

  // ===== 武器 追加分 (8枚) =====
  { id:'arm-naginata',          name:'Naginata',          series:'arms', imagePath:B+'assets/gacha/arms/naginata.png' },
  { id:'arm-dory-spear',        name:'Dory Spear',        series:'arms', imagePath:B+'assets/gacha/arms/dory-spear.png' },
  { id:'arm-halberd',           name:'Halberd',           series:'arms', imagePath:B+'assets/gacha/arms/halberd.png' },
  { id:'arm-crystalline-spear', name:'Crystalline Spear', series:'arms', imagePath:B+'assets/gacha/arms/crystalline-spear.png' },
  { id:'arm-flanged-mace',      name:'Flanged Mace',      series:'arms', imagePath:B+'assets/gacha/arms/flanged-mace.png' },
  { id:'arm-kanabo',            name:'Kanabō',            series:'arms', imagePath:B+'assets/gacha/arms/kanabo.png' },
  { id:'arm-war-hammer',        name:'War Hammer',        series:'arms', imagePath:B+'assets/gacha/arms/war-hammer.png' },
  { id:'arm-bronze-mace',       name:'Bronze Mace',       series:'arms', imagePath:B+'assets/gacha/arms/bronze-mace.png' },

  // ===== 武装生物 追加分 (8枚) =====
  { id:'ab-bald-eagle-missile',               name:'Bald Eagle with Missile Launcher',          series:'armbio', imagePath:B+'assets/gacha/armbio/bald-eagle-missile.png' },
  { id:'ab-japanese-horntail-dragonfly-gatling',name:'Japanese Horntail Dragonfly with Gatling', series:'armbio', imagePath:B+'assets/gacha/armbio/japanese-horntail-dragonfly-gatling.png' },
  { id:'ab-pterodactyl-laser',                name:'Pterodactyl with Laser Weapon System',      series:'armbio', imagePath:B+'assets/gacha/armbio/pterodactyl-laser.png' },
  { id:'ab-hummingbird-plasma',               name:'Hummingbird with Plasma Cannons',           series:'armbio', imagePath:B+'assets/gacha/armbio/hummingbird-plasma.png' },
  { id:'ab-great-white-shark-missile',        name:'Great White Shark with Missile Launcher',   series:'armbio', imagePath:B+'assets/gacha/armbio/great-white-shark-missile.png' },
  { id:'ab-giant-octopus-cannons',            name:'Giant Octopus with Multi-Barrel Cannons',   series:'armbio', imagePath:B+'assets/gacha/armbio/giant-octopus-cannons.png' },
  { id:'ab-humpback-whale-laser',             name:'Humpback Whale with Laser Weapon System',   series:'armbio', imagePath:B+'assets/gacha/armbio/humpback-whale-laser.png' },
  { id:'ab-japanese-spider-crab-plasma',      name:'Japanese Spider Crab with Plasma Cannons',  series:'armbio', imagePath:B+'assets/gacha/armbio/japanese-spider-crab-plasma.png' },

  // ===== 軍団 追加分 (8枚) =====
  { id:'cor-bald-eagle-eagle-army',        name:'Bald Eagle Leader & Eagle Army',        series:'corps', imagePath:B+'assets/gacha/corps/bald-eagle-eagle-army.png' },
  { id:'cor-owl-leader-owl-legion',        name:'Owl Leader & Owl Legion',               series:'corps', imagePath:B+'assets/gacha/corps/owl-leader-owl-legion.png' },
  { id:'cor-hawk-leader-hawk-army',        name:'Hawk Leader & Hawk Army',               series:'corps', imagePath:B+'assets/gacha/corps/hawk-leader-hawk-army.png' },
  { id:'cor-condor-leader-condor-legion',  name:'Condor Leader & Condor Legion',         series:'corps', imagePath:B+'assets/gacha/corps/condor-leader-condor-legion.png' },
  { id:'cor-orca-leader-orca-army',        name:'Orca Leader & Orca Army',               series:'corps', imagePath:B+'assets/gacha/corps/orca-leader-orca-army.png' },
  { id:'cor-octopus-leader-octopus-legion',name:'Octopus Leader & Octopus Legion',       series:'corps', imagePath:B+'assets/gacha/corps/octopus-leader-octopus-legion.png' },
  { id:'cor-tiger-shark-leader-shark-army',name:'Tiger Shark Leader & Shark Army',       series:'corps', imagePath:B+'assets/gacha/corps/tiger-shark-leader-shark-army.png' },
  { id:'cor-manta-ray-leader-manta-legion',name:'Manta Ray Leader & Manta Legion',       series:'corps', imagePath:B+'assets/gacha/corps/manta-ray-leader-manta-legion.png' },

  // ===== 城主 追加分 (4枚) =====
  { id:'cas-dungeness-crab-king',    name:'Dungeness Crab King & Coral Castle',      series:'catsle', imagePath:B+'assets/gacha/catsle/dungeness-crab-king.png' },
  { id:'cas-blue-whale-king',        name:'Blue Whale King & Sunken Palace',         series:'catsle', imagePath:B+'assets/gacha/catsle/blue-whale-king.png' },
  { id:'cas-giant-octopus-king',     name:'Giant Octopus King & Crystal Castle',     series:'catsle', imagePath:B+'assets/gacha/catsle/giant-octopus-king.png' },
  { id:'cas-great-white-shark-king', name:'Great White Shark King & Fortress Castle',series:'catsle', imagePath:B+'assets/gacha/catsle/great-white-shark-king.png' },

  // ===== 城主 (8枚) =====
  { id:'cas-white-lion-king',        name:'White Lion King',          series:'catsle', imagePath:B+'assets/gacha/catsle/white-lion-king.png' },
  { id:'cas-african-elephant-king',  name:'African Elephant King',    series:'catsle', imagePath:B+'assets/gacha/catsle/african-elephant-king.png' },
  { id:'cas-bald-eagle-king',        name:'Bald Eagle King',          series:'catsle', imagePath:B+'assets/gacha/catsle/bald-eagle-king.png' },
  { id:'cas-giant-stag-beetle-king', name:'Giant Stag Beetle King',   series:'catsle', imagePath:B+'assets/gacha/catsle/giant-stag-beetle-king.png' },
  { id:'cas-tiger-king',             name:'Tiger King',               series:'catsle', imagePath:B+'assets/gacha/catsle/tiger-king.png' },
  { id:'cas-sea-turtle-king',        name:'Sea Turtle King',          series:'catsle', imagePath:B+'assets/gacha/catsle/sea-turtle-king.png' },
  { id:'cas-polar-bear-king',        name:'Polar Bear King',          series:'catsle', imagePath:B+'assets/gacha/catsle/polar-bear-king.png' },
  { id:'cas-green-iguana-king',      name:'Green Iguana King',        series:'catsle', imagePath:B+'assets/gacha/catsle/green-iguana-king.png' },

  // ===== ✨ Legendary 生物 (4枚) =====
  { id:'leg-bio-dragon',   name:'Dragon',   series:'legendary-bio', imagePath:B+'assets/gacha/legendary/bio/legendary-dragon.png',   legendary:true },
  { id:'leg-bio-griffin',  name:'Griffin',  series:'legendary-bio', imagePath:B+'assets/gacha/legendary/bio/legendary-griffin.png',  legendary:true },
  { id:'leg-bio-unicorn',  name:'Unicorn',  series:'legendary-bio', imagePath:B+'assets/gacha/legendary/bio/legendary-unicorn.png',  legendary:true },
  { id:'leg-bio-phoenix',  name:'Phoenix',  series:'legendary-bio', imagePath:B+'assets/gacha/legendary/bio/legendary-phoenix.png',  legendary:true },

  // ===== ✨ Legendary 武器 (4枚) =====
  { id:'leg-arm-draconic-greatsword',   name:'Draconic Greatsword',  series:'legendary-arms', imagePath:B+'assets/gacha/legendary/arms/legendary-draconic-greatsword.png',   legendary:true },
  { id:'leg-arm-celestial-claymore',    name:'Celestial Claymore',   series:'legendary-arms', imagePath:B+'assets/gacha/legendary/arms/legendary-celestial-claymore.png',    legendary:true },
  { id:'leg-arm-demonic-zweihander',    name:'Demonic Zweihänder',   series:'legendary-arms', imagePath:B+'assets/gacha/legendary/arms/legendary-demonic-zweihander.png',    legendary:true },
  { id:'leg-arm-elven-warblade',        name:'Elven Warblade',       series:'legendary-arms', imagePath:B+'assets/gacha/legendary/arms/legendary-elven-warblade.png',        legendary:true },

  // ===== ✨ Legendary 武装生物 (4枚) =====
  { id:'leg-ab-chinese-dragon-missile', name:'Chinese Dragon with Missiles',      series:'legendary-armbio', imagePath:B+'assets/gacha/legendary/armbio/legendary-chinese-dragon-missile.png', legendary:true },
  { id:'leg-ab-hydra-gatling',          name:'Hydra with Gatling Guns',           series:'legendary-armbio', imagePath:B+'assets/gacha/legendary/armbio/legendary-hydra-gatling.png',          legendary:true },
  { id:'leg-ab-phoenix-laser',          name:'Phoenix with Laser Cannon',         series:'legendary-armbio', imagePath:B+'assets/gacha/legendary/armbio/legendary-phoenix-laser.png',          legendary:true },
  { id:'leg-ab-gryphon-plasma',         name:'Gryphon with Plasma Cannons',       series:'legendary-armbio', imagePath:B+'assets/gacha/legendary/armbio/legendary-gryphon-plasma.png',         legendary:true },

  // ===== ✨ Legendary 軍団 (4枚) =====
  { id:'leg-cor-phoenix-griffin-army',      name:'Phoenix & Griffin Army',          series:'legendary-corps', imagePath:B+'assets/gacha/legendary/corps/legendary-phoenix-griffin-army.png',      legendary:true },
  { id:'leg-cor-pegasus-unicorn-legion',    name:'Pegasus & Unicorn Legion',        series:'legendary-corps', imagePath:B+'assets/gacha/legendary/corps/legendary-pegasus-unicorn-legion.png',    legendary:true },
  { id:'leg-cor-dragon-wyvern-squadron',    name:'Dragon & Wyvern Squadron',        series:'legendary-corps', imagePath:B+'assets/gacha/legendary/corps/legendary-dragon-wyvern-squadron.png',    legendary:true },
  { id:'leg-cor-kraken-serpent-hoard',      name:'Kraken & Serpent Hoard',          series:'legendary-corps', imagePath:B+'assets/gacha/legendary/corps/legendary-kraken-serpent-hoard.png',      legendary:true },

  // ===== ✨ Legendary 城主 (4枚) =====
  { id:'leg-cas-ancient-dragon-king',      name:'Ancient Dragon King & Citadel',            series:'legendary-catsle', imagePath:B+'assets/gacha/legendary/catsle/legendary-ancient-dragon-king.png',      legendary:true },
  { id:'leg-cas-griffin-king',             name:'Griffin King & Arboreal Castle',            series:'legendary-catsle', imagePath:B+'assets/gacha/legendary/catsle/legendary-griffin-king.png',             legendary:true },
  { id:'leg-cas-crystal-golem-king',       name:'Crystal Golem King & Ice Castle',           series:'legendary-catsle', imagePath:B+'assets/gacha/legendary/catsle/legendary-crystal-golem-king.png',       legendary:true },
  { id:'leg-cas-obsidian-manticore-king',  name:'Obsidian Manticore King & Volcanic Fortress',series:'legendary-catsle', imagePath:B+'assets/gacha/legendary/catsle/legendary-obsidian-manticore-king.png',  legendary:true },
];

// 通常ガチャ（全体1%でLegendary、0.5%でLegendary確定演出つき）
export function rollGacha() {
  const rand = Math.random() * 100;
  // Legendary判定: 1%
  if (rand < 1.0) {
    return rollLegendary();
  }
  // 通常シリーズ
  const rand2 = Math.random() * 100;
  let cumulative = 0;
  let selectedSeries = 'bio';
  for (const s of SERIES) {
    cumulative += s.rate;
    if (rand2 < cumulative) { selectedSeries = s.id; break; }
  }
  const pool = STICKERS.filter(s => s.series === selectedSeries);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Legendary内のシリーズ重み付き抽選
function rollLegendary() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  let selectedSeries = 'legendary-bio';
  for (const s of LEGENDARY_SERIES) {
    cumulative += s.rate;
    if (rand < cumulative) { selectedSeries = s.id; break; }
  }
  const pool = STICKERS.filter(s => s.series === selectedSeries);
  return pool[Math.floor(Math.random() * pool.length)];
}

// LEGEND確定（0.5%確定演出用）：Legendaryから引く
export function rollGachaLegend() {
  return rollLegendary();
}

// 確定演出が出るかどうかの判定（0.5%）
export function isLegendaryConfirm() {
  return Math.random() < 0.005;
}
