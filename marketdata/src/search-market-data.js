export function searchMarketData(cryptocurrencies, query) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return cryptocurrencies
  }

  return cryptocurrencies.filter((crypto) => {
    const name = crypto.name.toLowerCase()
    const symbol = crypto.symbol.toLowerCase()

    return name.startsWith(normalizedQuery) || symbol.startsWith(normalizedQuery)
  })
}
