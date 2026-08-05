const PROVIDERS = [
  { name: 'youtube', re: /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/i },
  { name: 'instagram', re: /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+/i },
  { name: 'tiktok', re: /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i },
  { name: 'twitter', re: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/i },
];

function detectEmbedProvider(url) {
  const match = PROVIDERS.find((p) => p.re.test(url));
  return match ? match.name : null;
}

module.exports = { detectEmbedProvider };
