import './style.css'
import { fetchMarketData } from './fetch-market-data.js'
import { filterByTotalVolume } from './filter-market-data.js'
import { searchMarketData } from './search-market-data.js'

const app = document.querySelector('#app')
let marketData = []
let filteredMarketData = []

function renderCryptoList(cryptocurrencies) {
  return cryptocurrencies
    .map(
      (crypto) => `
        <li class="crypto-item">
          <img class="crypto-logo" src="${crypto.image}" alt="${crypto.name} logo">
          <h3>${crypto.name}</h3>
          <p class="crypto-symbol">${crypto.symbol.toUpperCase()}</p>
          <p>Current price: <strong>$${crypto.current_price.toLocaleString()}</strong></p>
          <p>Total volume: $${crypto.total_volume.toLocaleString()}</p>
        </li>
      `,
    )
    .join('')
}

function renderMarketData(cryptocurrencies) {
  document.querySelector('#market-data-count').textContent =
    `${cryptocurrencies.length} résultats sur ${marketData.length}`
  document.querySelector('.crypto-list').innerHTML = renderCryptoList(cryptocurrencies)
}

app.innerHTML = `
<section id="market-data">
  <h2 id="market-data-title">Cryptomonnaies</h2>
  <p id="market-data-count"></p>
  <input
    id="crypto-search"
    class="crypto-search"
    type="search"
    placeholder="Rechercher une crypto..."
    aria-label="Rechercher une cryptomonnaie par nom ou symbole"
  >
  <ul class="crypto-list"></ul>
</section>

<div class="ticks"></div>
<section id="spacer"></section>
`

marketData = await fetchMarketData()
filteredMarketData = filterByTotalVolume(marketData)
renderMarketData(filteredMarketData)

document.querySelector('#crypto-search').addEventListener('input', (event) => {
  renderMarketData(searchMarketData(filteredMarketData, event.target.value))
})
