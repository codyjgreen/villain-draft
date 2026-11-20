// ✏️ Edit this list to change the villains and wrapping. `img` is the portrait shown when the present is opened (emoji is the fallback). (`clue` isn't shown on the site — it's kept for your own reference.) `id` must be unique.
// Tip: only keep ONE Grunch — swap the role line if you're using the cleric version.
window.VILLAINS = [
  { id: 'grunch', img: 'img/grunch.webp', emoji: '😈', name: 'Grunch',         role: 'Tiefling Bard · silver tongue, illusions & Hold Person',
    clue: 'For the one whose heart is two sizes too small… and whose fault this all is.' },
  { id: 'mohawk', img: 'img/mohawk.webp', emoji: '👹', name: 'Mohawk Gremlin', role: 'Barbarian · rage, greataxe & armour spikes',
    clue: 'Do not get wet. Do not feed after midnight. Do not expect it to behave.' },
  { id: 'frost', img: 'img/jack-frost.webp', emoji: '❄️', name: 'Jack Frost',     role: 'Winter Sorcerer · frostbite, snowball swarms & icy breath',
    clue: 'Nips at noses. Dreams of beaches. Leaves patterns on your windows.' },
  { id: 'scrooge', img: 'img/scrooge.webp', emoji: '💰', name: 'Scrooge',        role: 'Wizard · Sleep, Web, Magic Missile — and a lot of money',
    clue: 'Bah! A present? What a waste of good money. …It\'s a very nice box, though.' },
  { id: 'hans', img: 'img/hans.webp', emoji: '🏢', name: 'Hans',           role: 'Paladin of Conquest · armoured leader & smites',
    clue: 'Expensive suit. Excellent vocabulary. Has a thing about tall buildings.' },
  { id: 'elf', img: 'img/angry-elf.webp', emoji: '😠', name: 'Angry Elf',      role: 'Monk · fast, furious, knocks people flat',
    clue: 'Call him an elf ONE more time. Go on. See what happens.' },
  { id: 'potato', img: 'img/potato-sack.webp', emoji: '🐛', name: 'Mr Potato Sack', role: 'Fiend Warlock · Eldritch Blast, Hex & bugs. So many bugs.',
    clue: 'Something inside is wriggling. Something inside is laughing. Do not open near Halloween Town.' },
  { id: 'bunny', img: 'img/easter-bunny.webp', emoji: '🐰', name: 'Easter Bunny',   role: 'Ranger · deadly archer with a basket of overcooked eggs',
    clue: 'Feels like it should\'ve arrived in the spring. Smells faintly of chocolate eggs and resentment.' },
  { id: 'harry', img: 'img/harry.webp', emoji: '🔐', name: 'Harry',          role: 'Thief Rogue · the brains of the burglar duo',
    clue: 'The brains of the operation. Pockets full of lock picks. Do not leave him home alone with a child.' },
  { id: 'marv', img: 'img/marv.webp', emoji: '🪣', name: 'Marv',           role: 'Scout Rogue · the muscle of the burglar duo',
    clue: 'The muscle of the operation. Has a fresh bruise shaped exactly like a paint can.' },
];

// Optional "Lump of Coal" present (toggle in the header).
window.COAL = { id: 'coal', emoji: '🪨', name: 'Lump of Coal', role: 'You\'ve been naughty! Steal a villain from someone — right now. No take-backs.',
  clue: 'Small. Heavy. Rattles ominously. Possibly a disappointment.' };

// Wrapping-paper palette: [paper, stripe, ribbon]
window.PAPERS = [
  ['#c62828', '#e53935', '#ffd54f'], ['#2e7d32', '#388e3c', '#ef5350'], ['#1565c0', '#1e88e5', '#ffffff'],
  ['#6a1b9a', '#8e24aa', '#ffd54f'], ['#f9a825', '#fbc02d', '#c62828'], ['#ad1457', '#d81b60', '#ffffff'],
  ['#00695c', '#00897b', '#ffd54f'], ['#e65100', '#f57c00', '#2e7d32'], ['#37474f', '#546e7a', '#ef5350'],
  ['#fafafa', '#e0e0e0', '#c62828'], ['#4e342e', '#6d4c41', '#ffd54f'],
];
