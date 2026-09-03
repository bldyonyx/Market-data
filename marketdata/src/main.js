import './style.css'
import { marketData } from './market-data.js'
import { filterByTotalVolume } from './filter-market-data.js'

const filteredMarketData = filterByTotalVolume(marketData)

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

document.querySelector('#app').innerHTML = `
<section id="market-data">
  <h2>Cryptomonnaies filtrées — ${filteredMarketData.length} / ${marketData.length} affichées</h2>
  <ul class="crypto-list">
    ${renderCryptoList(filteredMarketData)}
  </ul>
</section>

<div class="ticks"></div>
<section id="spacer"></section>
`
