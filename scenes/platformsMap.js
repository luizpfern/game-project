// Lista de plataformas do mapa
// Cada objeto representa uma plataforma: { x, y, width, height }

const platformsMap = [
  // Chão principal (grande bloco à esquerda)
  { x: 0, y: 560, width: 400, height: 60 },
  // Plataforma baixa à esquerda
  { x: 420, y: 520, width: 80, height: 20 },
  // "Escada" de blocos
  { x: 520, y: 480, width: 40, height: 40 },
  { x: 570, y: 440, width: 40, height: 40 },
  { x: 620, y: 400, width: 40, height: 40 },
  { x: 670, y: 360, width: 40, height: 40 },
  // Plataforma longa superior
  { x: 750, y: 260, width: 400, height: 40 },
  // Plataformas pequenas aéreas (meio)
  { x: 900, y: 340, width: 80, height: 20 },
  { x: 1050, y: 320, width: 80, height: 20 },
  { x: 1200, y: 300, width: 80, height: 20 },
  // Plataforma "escada" descendo
  { x: 1350, y: 340, width: 80, height: 20 },
  { x: 1450, y: 380, width: 80, height: 20 },
  { x: 1550, y: 420, width: 80, height: 20 },
  // Bloco grande central
  { x: 1700, y: 560, width: 300, height: 60 },
  // Plataforma pequena após abismo
  { x: 2020, y: 520, width: 80, height: 20 },
  // Plataforma alta para o inimigo grande
  { x: 2150, y: 420, width: 60, height: 80 },
  // Bloco final
  { x: 2250, y: 560, width: 200, height: 60 },
  { x: 2470, y: 560, width: 200, height: 60 }
];

export default platformsMap;
