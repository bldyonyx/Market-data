import './style.css'
import { fetchCryptoDetails, fetchMarketData } from './fetch-market-data.js'
import { filterByTotalVolume } from './filter-market-data.js'
import { searchMarketData } from './search-market-data.js'

const app = document.querySelector('#app')
const REFRESH_INTERVAL = 30_000
let marketData = []
let filteredMarketData = []
let currentSearchResults = []
let refreshIntervalId = null
let isRefreshingMarketData = false

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return 'Non disponible'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value)
}

function formatCompactCurrency(value) {
  if (value === null || value === undefined) {
    return 'Non disponible'
  }

  if (Math.abs(value) < 1000) {
    return formatCurrency(value)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return 'Non disponible'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercentage(value) {
  if (value === null || value === undefined) {
    return 'Non disponible'
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function stripHtml(value) {
  const parser = new DOMParser()
  const document = parser.parseFromString(value ?? '', 'text/html')

  return document.body.textContent?.trim() ?? ''
}

function getDetailValue(detail, listCrypto, path, fallbackKey) {
  const value = path.reduce((data, key) => data?.[key], detail)

  return value ?? listCrypto?.[fallbackKey]
}

function renderCryptoList(cryptocurrencies) {
  return cryptocurrencies
    .map(
      (crypto) => `
        <li class="crypto-item" data-id="${crypto.id}">
          <div class="crypto-card-header">
            <div class="crypto-card-title">
              <h3>${escapeHtml(crypto.name)}</h3>
              <p class="crypto-symbol">${escapeHtml(crypto.symbol.toUpperCase())}</p>
            </div>
            <img class="crypto-logo" src="${crypto.image}" alt="${escapeHtml(crypto.name)} logo">
          </div>
          <div class="crypto-card-stats">
            <p><span>Current price</span> <strong>${formatCurrency(crypto.current_price)}</strong></p>
            <p><span>Total volume</span> ${formatCompactCurrency(crypto.total_volume)}</p>
          </div>
        </li>
      `,
    )
    .join('')
}

function renderMarketData(cryptocurrencies) {
  currentSearchResults = cryptocurrencies
  document.querySelector('#market-data-count').textContent =
    `${cryptocurrencies.length} résultats sur ${marketData.length}`
  document.querySelector('.crypto-list').innerHTML = renderCryptoList(cryptocurrencies)
}

function renderMarketDataError() {
  document.querySelector('#market-data-count').textContent =
    'Impossible d actualiser les donnees pour le moment.'
}

function getVisibleMarketData() {
  const searchQuery = document.querySelector('#crypto-search')?.value ?? ''

  return searchMarketData(filteredMarketData, searchQuery)
}

async function refreshMarketData() {
  if (isRefreshingMarketData) {
    return
  }

  isRefreshingMarketData = true

  try {
    marketData = await fetchMarketData()
    filteredMarketData = filterByTotalVolume(marketData)
    renderMarketData(getVisibleMarketData())
  } catch (error) {
    console.error(error)
    renderMarketDataError()
  } finally {
    isRefreshingMarketData = false
  }
}

function startMarketDataRefresh() {
  if (refreshIntervalId !== null) {
    return
  }

  refreshMarketData()
  refreshIntervalId = window.setInterval(refreshMarketData, REFRESH_INTERVAL)
}

function renderDetailStat(label, value) {
  return `
    <div class="crypto-detail-stat">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `
}

function renderCryptoDetails(detail, listCrypto) {
  const detailMarketData = detail.market_data ?? {}
  const name = detail.name ?? listCrypto?.name ?? 'Crypto'
  const symbol = detail.symbol ?? listCrypto?.symbol ?? ''
  const image = detail.image?.large ?? detail.image?.small ?? listCrypto?.image
  const currentPrice = getDetailValue(
    detail,
    listCrypto,
    ['market_data', 'current_price', 'usd'],
    'current_price',
  )
  const priceChange24h = getDetailValue(
    detail,
    listCrypto,
    ['market_data', 'price_change_percentage_24h'],
    'price_change_percentage_24h',
  )
  const description = stripHtml(detail.description?.en)
  const priceChangeClass =
    priceChange24h === null || priceChange24h === undefined
      ? ''
      : priceChange24h >= 0
        ? 'is-positive'
        : 'is-negative'

  document.querySelector('#crypto-detail').innerHTML = `
    <button class="mb-5 inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-(--accent-border) bg-(--bg) px-3.5 py-2 font-[inherit] text-(--text-h) transition-[border-color,box-shadow] duration-200 hover:border-(--accent) hover:shadow-[0_0_0_3px_var(--accent-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)" type="button" id="back-to-list">← Retour</button>
    <article class="crypto-detail-card">
      <div class="crypto-detail-header">
        ${
          image
            ? `<img class="crypto-detail-logo" src="${image}" alt="${escapeHtml(name)} logo">`
            : ''
        }
        <div>
          <p class="crypto-detail-symbol">${escapeHtml(symbol.toUpperCase())}</p>
          <h2>${escapeHtml(name)}</h2>
          <p class="crypto-detail-price">${formatCurrency(currentPrice)}</p>
          <p class="crypto-detail-change ${priceChangeClass}">${formatPercentage(priceChange24h)} sur 24h</p>
        </div>
      </div>

      <div class="crypto-detail-grid">
        ${renderDetailStat('Rang market cap', formatNumber(detail.market_cap_rank ?? listCrypto?.market_cap_rank))}
        ${renderDetailStat('Market cap', formatCurrency(getDetailValue(detail, listCrypto, ['market_data', 'market_cap', 'usd'], 'market_cap')))}
        ${renderDetailStat('Volume 24h', formatCurrency(getDetailValue(detail, listCrypto, ['market_data', 'total_volume', 'usd'], 'total_volume')))}
        ${renderDetailStat('Plus haut 24h', formatCurrency(getDetailValue(detail, listCrypto, ['market_data', 'high_24h', 'usd'], 'high_24h')))}
        ${renderDetailStat('Plus bas 24h', formatCurrency(getDetailValue(detail, listCrypto, ['market_data', 'low_24h', 'usd'], 'low_24h')))}
        ${renderDetailStat('ATH', formatCurrency(detailMarketData.ath?.usd ?? listCrypto?.ath))}
        ${renderDetailStat('ATL', formatCurrency(detailMarketData.atl?.usd ?? listCrypto?.atl))}
        ${renderDetailStat('Circulating supply', formatNumber(detailMarketData.circulating_supply ?? listCrypto?.circulating_supply))}
        ${renderDetailStat('Total supply', formatNumber(detailMarketData.total_supply ?? listCrypto?.total_supply))}
        ${renderDetailStat('Max supply', formatNumber(detailMarketData.max_supply ?? listCrypto?.max_supply))}
      </div>

      ${
        description
          ? `<section class="crypto-detail-description">
              <h3>Description</h3>
              <p>${escapeHtml(description)}</p>
            </section>`
          : ''
      }
    </article>
  `
}

function showListView() {
  document.querySelector('#market-list-view').hidden = false
  document.querySelector('#crypto-detail').hidden = true
  document.querySelector('#crypto-detail').innerHTML = ''
}

function showDetailView() {
  document.querySelector('#market-list-view').hidden = true
  document.querySelector('#crypto-detail').hidden = false
}

function renderDetailLoading(crypto) {
  document.querySelector('#crypto-detail').innerHTML = `
    <button class="mb-5 inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-(--accent-border) bg-(--bg) px-3.5 py-2 font-[inherit] text-(--text-h) transition-[border-color,box-shadow] duration-200 hover:border-(--accent) hover:shadow-[0_0_0_3px_var(--accent-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)" type="button" id="back-to-list">← Retour</button>
    <div class="crypto-detail-card">
      <p>Chargement des détails de ${escapeHtml(crypto.name)}...</p>
    </div>
  `
}

function renderDetailError(crypto) {
  document.querySelector('#crypto-detail').innerHTML = `
    <button class="mb-5 inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-(--accent-border) bg-(--bg) px-3.5 py-2 font-[inherit] text-(--text-h) transition-[border-color,box-shadow] duration-200 hover:border-(--accent) hover:shadow-[0_0_0_3px_var(--accent-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)" type="button" id="back-to-list">← Retour</button>
    <div class="crypto-detail-card">
      <h2>${escapeHtml(crypto.name)}</h2>
      <p>Impossible de charger les détails pour le moment.</p>
    </div>
  `
}

app.innerHTML = `
<section id="market-data">
  <div id="market-list-view">
    <div class="market-toolbar">
      <div>
        <h2 id="market-data-title">Cryptomonnaies</h2>
        <p id="market-data-count"></p>
      </div>
      <input
        id="crypto-search"
        class="crypto-search"
        type="search"
        placeholder="Rechercher une crypto..."
        aria-label="Rechercher une cryptomonnaie par nom ou symbole"
      >
    </div>
    <ul class="crypto-list"></ul>
  </div>
  <div id="crypto-detail" hidden></div>
</section>

<div class="ticks"></div>
<section id="spacer"></section>
<button class="back-to-top invisible pointer-events-none fixed right-[max(18px,env(safe-area-inset-right))] bottom-[max(18px,env(safe-area-inset-bottom))] z-20 inline-grid h-11 w-11 translate-y-3 cursor-pointer place-items-center rounded-lg border border-(--accent-border) bg-(--bg) text-(--text-h) opacity-0 shadow-(--shadow) transition-[border-color,box-shadow,opacity,transform,visibility] duration-200 hover:border-(--accent) hover:shadow-[var(--shadow),0_0_0_3px_var(--accent-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) max-[520px]:right-[max(14px,env(safe-area-inset-right))] max-[520px]:bottom-[max(14px,env(safe-area-inset-bottom))] max-[520px]:h-10.5 max-[520px]:w-10.5" type="button" id="back-to-top" aria-label="Retour en haut" aria-hidden="true">
  <svg class="h-5.5 w-5.5 fill-current" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
    <path d="M12 5l-7 7 1.4 1.4L11 8.8V20h2V8.8l4.6 4.6L19 12z"></path>
  </svg>
</button>
`

startMarketDataRefresh()

const backToTopButton = document.querySelector('#back-to-top')
const backToTopThreshold = 320

function updateBackToTopVisibility() {
  const shouldShow = window.scrollY > backToTopThreshold

  backToTopButton.classList.toggle('is-visible', shouldShow)
  backToTopButton.setAttribute('aria-hidden', String(!shouldShow))
  backToTopButton.tabIndex = shouldShow ? 0 : -1
}

backToTopButton.addEventListener('click', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  })
})

window.addEventListener('scroll', updateBackToTopVisibility, { passive: true })
updateBackToTopVisibility()

document.querySelector('#crypto-search').addEventListener('input', (event) => {
  renderMarketData(searchMarketData(filteredMarketData, event.target.value))
})

document.querySelector('#market-data').addEventListener('click', async (event) => {
  if (event.target.closest('#back-to-list')) {
    showListView()
    return
  }

  const cryptoItem = event.target.closest('.crypto-item')

  if (!cryptoItem) {
    return
  }

  const selectedCrypto = currentSearchResults.find((crypto) => crypto.id === cryptoItem.dataset.id)

  if (!selectedCrypto) {
    return
  }

  showDetailView()
  renderDetailLoading(selectedCrypto)

  try {
    const cryptoDetails = await fetchCryptoDetails(selectedCrypto.id)
    renderCryptoDetails(cryptoDetails, selectedCrypto)
  } catch (error) {
    console.error(error)
    renderDetailError(selectedCrypto)
  }
})
