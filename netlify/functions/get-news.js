const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const API_KEY = 'a004ca8cb8a14598a41d63adf36ffcbf';
    const category = event.queryStringParameters?.category || 'mundial';
    
    const queries = {
      mundial: 'internacional OR world OR global OR breaking news',
      local: 'República Dominicana OR Dominican Republic OR Santo Domingo',
      farandula: 'baseball OR béisbol OR entertainment OR farándula OR MLB'
    };

    const query = queries[category] || queries.mundial;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=6&language=es&apiKey=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      const formattedNews = data.articles.map(article => ({
        texto: formatNewsTitle(article.title, category),
        enlace: article.url || '#',
        fecha: article.publishedAt
      }));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          noticias: formattedNews,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      const fallbackNews = getFallbackNews(category);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          noticias: fallbackNews,
          timestamp: new Date().toISOString(),
          fallback: true
        })
      };
    }
    
  } catch (error) {
    console.error('Error:', error);
    const fallbackNews = getFallbackNews(event.queryStringParameters?.category || 'mundial');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        noticias: fallbackNews,
        timestamp: new Date().toISOString(),
        fallback: true
      })
    };
  }
};

function formatNewsTitle(title, category) {
  const emojis = {
    mundial: ['🌍', '🇺🇸', '🇪🇺', '🇨🇳', '🌊', '🏛️', '💰', '🔥'],
    local: ['🇩🇴', '🏛️', '💰', '🏥', '🛣️', '⚡', '🌿', '🚁'],
    farandula: ['🎤', '⚾', '📱', '🎭', '💃', '🏆', '📺', '🎵']
  };
  
  const categoryEmojis = emojis[category] || ['📰'];
  const emoji = categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
  
  let cleanTitle = title.replace(/[^\w\s\-áéíóúñü]/gi, '').substring(0, 80);
  if (title.length > 80) cleanTitle += '...';
  
  return `${emoji} ${cleanTitle}`;
}

function getFallbackNews(category) {
  const fallback = {
    mundial: [
      {texto: "🌍 Noticias internacionales actualizándose automáticamente", enlace: "https://cnnespanol.cnn.com/mundo"},
      {texto: "🇺🇸 Desarrollos políticos importantes en Estados Unidos", enlace: "https://cnnespanol.cnn.com/politica"},
      {texto: "💰 Mercados financieros globales en constante movimiento", enlace: "https://cnnespanol.cnn.com/economia"},
      {texto: "🌊 Situaciones climáticas impactan regiones mundiales", enlace: "https://news.un.org/es/news"},
      {texto: "🏛️ Decisiones diplomáticas marcan agenda internacional", enlace: "https://cnnespanol.cnn.com/mundo"},
      {texto: "🔥 Eventos significativos requieren atención global", enlace: "https://cnnespanol.cnn.com/mundo"}
    ],
    local: [
      {texto: "🇩🇴 República Dominicana implementa políticas de desarrollo", enlace: "https://listindiario.com/"},
      {texto: "💰 Indicadores económicos nacionales muestran dinamismo", enlace: "https://hoy.com.do/"},
      {texto: "🏥 Sistema sanitario dominicano recibe importantes inversiones", enlace: "https://almomento.net/"},
      {texto: "🛣️ Proyectos de infraestructura transforman el país", enlace: "https://listindiario.com/"},
      {texto: "⚡ Sector energético registra mejoras sustanciales", enlace: "https://hoy.com.do/"},
      {texto: "🇭🇹 Relaciones fronterizas mantienen atención especial", enlace: "https://almomento.net/"}
    ],
    farandula: [
      {texto: "⚾ Peloteros dominicanos destacan en ligas internacionales", enlace: "https://www.mlb.com/es/news"},
      {texto: "🎤 Música dominicana conquista mercados globales", enlace: "https://www.univision.com/temas/farandula"},
      {texto: "📱 Creadores de contenido dominicanos alcanzan millones", enlace: "https://www.telemundo.com/entretenimiento/farandula"},
      {texto: "🎭 Arte y cultura dominicana ganan reconocimiento mundial", enlace: "https://cnnespanol.cnn.com/entretenimiento"},
      {texto: "💃 Géneros musicales caribeños mantienen popularidad global", enlace: "https://www.univision.com/temas/farandula"},
      {texto: "🏆 Atletas criollos brillan en competencias internacionales", enlace: "https://www.mlb.com/es/news"}
    ]
  };
  
  return fallback[category] || fallback.mundial;
}
