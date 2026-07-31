const articles = [
  { slug: 'escenario-chico', category: 'Blogs de opinión', title: '¿Por qué el escenario chico siempre roba la función?', date: '12 jul 2026', author: 'Dana Ibarra', excerpt: 'Una defensa del stage secundario, donde pasan las cosas más raras (y las mejores).' },
  { slug: 'discos-del-ano', category: 'Blogs de opinión', title: 'Cinco discos que definieron el año en la escena local', date: '05 jul 2026', author: 'Rodrigo Nava', excerpt: 'Un repaso —parcial y necio— de lo que sonó fuerte este año.' },
  { slug: 'declamacion-no-esta-muerta', category: 'Blogs de opinión', title: 'La declamación no está muerta, solo se cambió de casa', date: '28 jun 2026', author: 'Dana Ibarra', excerpt: 'De la escuela al escenario: cómo un género "de tarea" se volvió parte del cartelera.' },
  { slug: 'noche-poesia-musica', category: 'Reportaje de eventos', title: 'Así se vivió la noche de poesía + música en vivo', date: '10 jul 2026', author: 'Emilio Cortés', excerpt: 'Crónica de una función que empezó en silencio y terminó con toda la carpa de pie.' },
  { slug: 'detras-camaras-expo', category: 'Reportaje de eventos', title: 'Detrás de cámaras: montando la expo de artes visuales', date: '02 jul 2026', author: 'Emilio Cortés', excerpt: 'Cuarenta y ocho horas para transformar la Galería Norte.' },
  { slug: 'cronica-escultura-vivo', category: 'Reportaje de eventos', title: 'Crónica: escultura en vivo en el Patio MRGNT', date: '24 jun 2026', author: 'Valeria Soto', excerpt: 'Ver una pieza tomar forma en tiempo real, con banda invitada de fondo.' },
  { slug: 'como-se-arma-cartelera', category: 'Periodismo musical', title: 'Cómo se arma el cartelera de MRGNT cada temporada', date: '14 jul 2026', author: 'Rodrigo Nava', excerpt: 'Una mirada a las decisiones —y los descartes— detrás del line-up.' },
  { slug: 'equipo-sonido', category: 'Periodismo musical', title: 'Entre bambalinas con el equipo de sonido', date: '07 jul 2026', author: 'Valeria Soto', excerpt: 'Lo que se necesita para que cinco disciplinas suenen bien en el mismo festival.' },
  { slug: 'circuito-independiente', category: 'Periodismo musical', title: 'El circuito independiente sigue creciendo', date: '30 jun 2026', author: 'Emilio Cortés', excerpt: 'Más espacios, más públicos, más disciplinas compartiendo cartel.' },
  { slug: 'entrevista-mural', category: 'Entrevistas', title: 'Conoce a la artista detrás del mural de este año', date: '11 jul 2026', author: 'Dana Ibarra', excerpt: 'Una charla sobre color, escala y pintar en vivo frente a cientos de personas.' },
  { slug: 'entrevista-escultor', category: 'Entrevistas', title: '"La escultura también se improvisa" — plática con un escultor', date: '03 jul 2026', author: 'Rodrigo Nava', excerpt: 'Sobre trabajar en vivo, cambiar de plan a medio proceso y no tenerle miedo al error.' },
  { slug: 'nueva-generacion-declamadores', category: 'Entrevistas', title: 'Cinco preguntas a la nueva generación de declamadores', date: '26 jun 2026', author: 'Valeria Soto', excerpt: 'Voces jóvenes que están llevando la declamación a nuevos escenarios.' },
];

const events = [
  { date: '08 ago 2026', time: '8:00 PM', stage: 'Foro Central', artist: 'Noche de poesía + música en vivo', tag: 'Destacado' },
  { date: '14 ago 2026', time: '7:30 PM', stage: 'Galería Norte', artist: 'Exposición de artes visuales', tag: '' },
  { date: '23 ago 2026', time: '6:00 PM', stage: 'Patio MRGNT', artist: 'Escultura en vivo + banda invitada', tag: '' },
  { date: '29 ago 2026', time: '9:00 PM', stage: 'Main Stage', artist: 'Nova Sol', tag: 'Headliner' },
  { date: '05 sep 2026', time: '6:30 PM', stage: 'Carpa Sur', artist: 'Declamación a micrófono abierto', tag: '' },
  { date: '12 sep 2026', time: '11:00 PM', stage: 'Warehouse', artist: 'Kessler', tag: 'Headliner' },
  { date: '19 sep 2026', time: '6:00 PM', stage: 'Garden', artist: 'Marigold Static', tag: '' },
  { date: '26 sep 2026', time: '5:00 PM', stage: 'Main Stage', artist: 'DJ Compass', tag: '' },
];

const artists = [
  { name: 'Renata Vidal', discipline: 'Poesía', genre: 'Poesía escénica', featured: true },
  { name: 'Julián Reyes', discipline: 'Poesía', genre: 'Poesía experimental' },
  { name: 'Colectivo Tinta Cruda', discipline: 'Poesía', genre: 'Poesía coral' },
  { name: 'Marcos del Río', discipline: 'Declamación', genre: 'Declamación clásica', featured: true },
  { name: 'Lucía Ferreyra', discipline: 'Declamación', genre: 'Declamación contemporánea' },
  { name: 'Nova Sol', discipline: 'Música', genre: 'Afrobeat / Electrónica', featured: true },
  { name: 'Kessler', discipline: 'Música', genre: 'Techno' },
  { name: 'Marigold Static', discipline: 'Música', genre: 'Indie / Dream pop' },
  { name: 'DJ Compass', discipline: 'Música', genre: 'House' },
  { name: 'Ana Belén Ruiz', discipline: 'Artes visuales', genre: 'Muralismo', featured: true },
  { name: 'Tomás Higuera', discipline: 'Artes visuales', genre: 'Fotografía documental' },
  { name: 'Colectivo Órbita', discipline: 'Artes visuales', genre: 'Instalación' },
  { name: 'Ignacio Prado', discipline: 'Escultura', genre: 'Escultura en metal', featured: true },
  { name: 'Cami Salgado', discipline: 'Escultura', genre: 'Escultura en barro' },
];

module.exports = { articles, events, artists };
