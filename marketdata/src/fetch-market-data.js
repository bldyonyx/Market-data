const COINGECKO_MARKETS_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true'
const COINGECKO_COIN_URL = 'https://api.coingecko.com/api/v3/coins'

export async function fetchMarketData() {
  const response = await fetch(COINGECKO_MARKETS_URL)

  if (!response.ok) {
    throw new Error('Impossible de recuperer les donnees CoinGecko')
  }

  const marketData = await response.json()

  return marketData.map((crypto) => ({
    id: crypto.id,
    name: crypto.name,
    symbol: crypto.symbol,
    image: crypto.image,
    current_price: crypto.current_price,
    price_change_percentage_24h: crypto.price_change_percentage_24h,
    market_cap_rank: crypto.market_cap_rank,
    market_cap: crypto.market_cap,
    total_volume: crypto.total_volume,
    high_24h: crypto.high_24h,
    low_24h: crypto.low_24h,
    ath: crypto.ath,
    atl: crypto.atl,
    circulating_supply: crypto.circulating_supply,
    total_supply: crypto.total_supply,
    max_supply: crypto.max_supply,
    sparkline: crypto.sparkline_in_7d?.price ?? [],
  }))
}

export async function fetchCryptoDetails(id) {
  const response = await fetch(
    `${COINGECKO_COIN_URL}/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
  )

  if (!response.ok) {
    throw new Error('Impossible de recuperer les details CoinGecko')
  }

  return response.json()
}
