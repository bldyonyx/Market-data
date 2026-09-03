export function filterByTotalVolume(cryptocurrencies) {
  return cryptocurrencies.filter((crypto) => crypto.total_volume >= 1000000)
}
