const COINGECKO_MARKETS_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'

export async function fetchMarketData() {
  const response = await fetch(COINGECKO_MARKETS_URL)

  if (!response.ok) {
    throw new Error('Impossible de recuperer les donnees CoinGecko')
  }

  const marketData = await response.json()

  return marketData.map((crypto) => ({
    name: crypto.name,
    symbol: crypto.symbol,
    image: crypto.image,
    current_price: crypto.current_price,
    total_volume: crypto.total_volume,
  }))
}
