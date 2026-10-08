/**
 * Taken from the rulebook (app/public/rules-fr.pdf, vector fills and text colours): black ink on white
 * paper, and one accent, the print magenta of the numbered discs and of the highlighted sentences.
 */
export const colors = {
  // Ink: every text of the rulebook (#231F20), and the grey of its secondary lines (#4C4C4E).
  ink: '#231F20',
  inkSoft: '#4C4C4E',

  // Paper: the page (#F4F3F3), slightly warmer under the illustrations (#FAF6F8).
  paper: '#F4F3F3',
  paperWarm: '#FAF6F8',

  // Magenta: the numbered discs and the titles' accents (#EC008C). Darker variants for white text and pressed states.
  magenta: '#EC008C',
  magentaDeep: '#C8007A',
  magentaDark: '#9E0060',

  // Sakura: the pink frames (#EE86A3) and the highlight behind the key sentences (#F8C1D9).
  sakura: '#EE86A3',
  blossom: '#F8C1D9',
  blossomLight: '#FCE6F0',

  // Wisteria: the mauve of the robes (#886E8E), for what is secondary.
  wisteria: '#886E8E',

  // Torii vermilion (#ED1C24): the alert colour, and nothing else.
  vermilion: '#B3261E',
  vermilionLight: '#FAD4D2',
  vermilionLighter: '#F5B5B1'
}
