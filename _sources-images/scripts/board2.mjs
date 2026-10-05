import fs from 'fs'
// The board has no shadow: it is the cut of board.mjs as is
const [S, OUT] = process.argv.slice(2)
fs.copyFileSync(`${S}/board-noshadow.png`, `${OUT}/boards/board.png`)
