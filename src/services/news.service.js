import NewsAPI from 'newsapi';

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

const getNews = async ({ page = 1, pageSize = 10 } = {}) => {
  const response = await newsapi.v2.everything({
    domains: 'kompas.com,detik.com,tempo.co,tribunnews.com,cnnindonesia.com,liputan6.com,republika.co.id',
    sortBy: 'publishedAt',
    pageSize,
    page,
  });

  if (response.status !== 'ok') {
    const error = new Error('Failed to fetch news.');
    error.statusCode = 502;
    throw error;
  }

  return {
    totalResults: response.totalResults,
    articles: response.articles.map((article) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source?.name,
    })),
  };
};

export { getNews };