import './style.css'
import { marketData } from './market-data.js'
import { filterByTotalVolume } from './filter-market-data.js'
import { searchMarketData } from './search-market-data.js'

const filteredMarketData = filterByTotalVolume(marketData)
const app = document.querySelector('#app')

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
  document.querySelector('#market-data-title').textContent =
    `Cryptomonnaies filtrées — ${cryptocurrencies.length} / ${marketData.length} affichées`
  document.querySelector('.crypto-list').innerHTML = renderCryptoList(cryptocurrencies)
}

app.innerHTML = `
<section id="market-data">
  <h2 id="market-data-title"></h2>
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

renderMarketData(filteredMarketData)

document.querySelector('#crypto-search').addEventListener('input', (event) => {
  renderMarketData(searchMarketData(filteredMarketData, event.target.value))
})
