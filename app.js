const app = {
  data: [],

  init() {
    this.loadData();
    this.bindEvents();
    this.renderCountries();
    this.setDefaultDate();
  },

  loadData() {
    const stored = localStorage.getItem('holidayLogs');
    this.data = stored ? JSON.parse(stored) : [];
  },

  saveData() {
    localStorage.setItem('holidayLogs', JSON.stringify(this.data));
  },

  setDefaultDate() {
    const dateInput = document.getElementById('entry-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  },

  bindEvents() {
    const form = document.getElementById('entry-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addEntry();
      });
    }

    const countrySelect = document.getElementById('entry-country');
    if (countrySelect) {
      countrySelect.addEventListener('change', () => {
        this.updateCityOptions();
      });
    }

    const filterCountry = document.getElementById('filter-country');
    if (filterCountry) {
      filterCountry.addEventListener('change', () => {
        this.updateFilterCity();
        this.renderLogs();
      });
    }

    const filterCity = document.getElementById('filter-city');
    if (filterCity) {
      filterCity.addEventListener('change', () => {
        this.renderLogs();
      });
    }

    const filterCategory = document.getElementById('filter-category');
    if (filterCategory) {
      filterCategory.addEventListener('change', () => {
        this.renderLogs();
      });
    }

    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportCSV();
      });
    }
  },

  countries: {
    'France': ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux'],
    'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Sapporo'],
    'United States': ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami'],
    'Italy': ['Rome', 'Florence', 'Venice', 'Milan', 'Naples'],
    'Spain': ['Madrid', 'Barcelona', 'Seville', 'Granada', 'Valencia'],
    'United Kingdom': ['London', 'Edinburgh', 'Manchester', 'Bath', 'Oxford'],
    'Germany': ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    'Brazil': ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Florianópolis', 'Manaus'],
    'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Koh Samui', 'Pai'],
    'Mexico': ['Mexico City', 'Cancún', 'Oaxaca', 'Guadalajara', 'Tulum'],
    'India': ['Mumbai', 'Delhi', 'Jaipur', 'Goa', 'Varanasi'],
    'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Quebec City', 'Banff'],
    'Portugal': ['Lisbon', 'Porto', 'Algarve', 'Sintra', 'Coimbra'],
    'Greece': ['Athens', 'Santorini', 'Mykonos', 'Crete', 'Rhodes'],
    'Other': ['Other']
  },

  categories: [
    'Accommodation',
    'Food & Dining',
    'Transportation',
    'Activities & Tours',
    'Shopping',
    'Entertainment',
    'Health & Wellness',
    'Communication',
    'Visa & Fees',
    'Miscellaneous'
  ],

  renderCountries() {
    const countrySelects = ['entry-country', 'filter-country'];
    countrySelects.forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;

      const isFilter = id === 'filter-country';
      if (isFilter) {
        select.innerHTML = '<option value="">All Countries</option>';
      } else {
        select.innerHTML = '<option value="">Select Country</option>';
      }

      Object.keys(this.countries).forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        select.appendChild(option);
      });
    });

    this.updateCityOptions();
    this.updateFilterCity();
    this.renderCategoryOptions();
    this.renderLogs();
  },

  updateCityOptions() {
    const countrySelect = document.getElementById('entry-country');
    const citySelect = document.getElementById('entry-city');
    if (!countrySelect || !citySelect) return;

    const selectedCountry = countrySelect.value;
    citySelect.innerHTML = '<option value="">Select City</option>';

    if (selectedCountry && this.countries[selectedCountry]) {
      this.countries[selectedCountry].forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
      citySelect.disabled = false;
    } else {
      citySelect.disabled = true;
    }
  },

  updateFilterCity() {
    const filterCountry = document.getElementById('filter-country');
    const filterCity = document.getElementById('filter-city');
    if (!filterCountry || !filterCity) return;

    const selectedCountry = filterCountry.value;
    filterCity.innerHTML = '<option value="">All Cities</option>';

    if (selectedCountry && this.countries[selectedCountry]) {
      this.countries[selectedCountry].forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        filterCity.appendChild(option);
      });
      filterCity.disabled = false;
    } else {
      filterCity.disabled = true;
    }
  },

  renderCategoryOptions() {
    const categorySelects = ['entry-category', 'filter-category'];
    categorySelects.forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;

      const isFilter = id === 'filter-category';
      if (isFilter) {
        select.innerHTML = '<option value="">All Categories</option>';
      } else {
        select.innerHTML = '<option value="">Select Category</option>';
      }

      this.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
      });
    });
  },

  addEntry() {
    const date = document.getElementById('entry-date').value;
    const country = document.getElementById('entry-country').value;
    const city = document.getElementById('entry-city').value;
    const category = document.getElementById('entry-category').value;
    const amount = parseFloat(document.getElementById('entry-amount').value);
    const currency = document.getElementById('entry-currency').value;
    const note = document.getElementById('entry-note').value.trim();

    if (!date || !country || !city || !category || isNaN(amount) || amount < 0) {
      this.showNotification('Please fill in all required fields correctly.', 'error');
      return;
    }

    const entry = {
      id: Date.now(),
      date,
      country,
      city,
      category,
      amount,
      currency: currency || 'USD',
      note,
      createdAt: new Date().toISOString()
    };

    this.data.push(entry);
    this.saveData();
    this.renderLogs();
    this.showNotification('Entry added successfully!', 'success');
    this.resetForm();
  },

  resetForm() {
    const form = document.getElementById('entry-form');
    if (form) {
      form.reset();
      this.setDefaultDate();
      document.getElementById('entry-city').disabled = true;
      document.getElementById('entry-city').innerHTML = '<option value="">Select City</option>';
    }
  },

  deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
      this.data = this.data.filter(entry => entry.id !== id);
      this.saveData();
      this.renderLogs();
      this.showNotification('Entry deleted.', 'info');
    }
  },

  getFilteredData() {
    const filterCountry = document.getElementById('filter-country')?.value || '';
    const filterCity = document.getElementById('filter-city')?.value || '';
    const filterCategory = document.getElementById('filter-category')?.value || '';

    return this.data.filter(entry => {
      const matchCountry = !filterCountry || entry.country === filterCountry;
      const matchCity = !filterCity || entry.city === filterCity;
      const matchCategory = !filterCategory || entry.category === filterCategory;
      return matchCountry && matchCity && matchCategory;
    });
  },

  groupByCountryAndCity(entries) {
    const grouped = {};
    entries.forEach(entry => {
      if (!grouped[entry.country]) {
        grouped[entry.country] = {};
      }
      if (!grouped[entry.country][entry.city]) {
        grouped[entry.country][entry.city] = [];
      }
      grouped[entry.country][entry.city].push(entry);
    });
    return grouped;
  },

  renderLogs() {
    const container = document.getElementById('logs-container');
    const summary = document.getElementById('summary-section');
    if (!container) return;

    const filtered = this.getFilteredData();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🗺️</div>
          <h3>No entries found</h3>
          <p>Start logging your holiday expenses above!</p>
        </div>
      `;
      if (summary) summary.innerHTML = '';
      return;
    }

    const grouped = this.groupByCountryAndCity(filtered);
    let html = '';

    const sortedCountries = Object.keys(grouped).sort();
    sortedCountries.forEach(country => {
      html += `<div class="country-group">`;
      html += `<div class="country-header"><span class="country-flag">${this.getCountryFlag(country)}</span> ${country}</div>`;

      const sortedCities = Object.keys(grouped[country]).sort();
      sortedCities.forEach(city => {
        const cityEntries = grouped[country][city].sort((a, b) => new Date(b.date) - new Date(a.date));
        const cityTotal = cityEntries.reduce((sum, e) => sum + e.amount, 0);

        html += `<div class="city-group">`;
        html += `
          <div class="city-header">
            <span class="city-name">📍 ${city}</span>
            <span class="city-total">${cityEntries.length} entries</span>
          </div>
        `;
        html += `<div class="entries-list">`;

        cityEntries.forEach(entry => {
          html += `
            <div class="entry-card" data-id="${entry.id}">
              <div class="entry-main">
                <div class="entry-info">
                  <span class="entry-date">${this.formatDate(entry.date)}</span>
                  <span class="entry-category category-badge">${entry.category}</span>
                </div>
                <div class="entry-amount">${entry.currency} ${entry.amount.toFixed(2)}</div>
              </div>
              ${entry.note ? `<div class="entry-note">${this.escapeHtml(entry.note)}</div>` : ''}
              <div class="entry-actions">
                <button class="btn-delete" onclick="app.deleteEntry(${entry.id})">Delete</button>
              </div>
            </div>
          `;
        });

        html += `</div>`;
        html += `</div>`;
      });

      html += `</div>`;
    });

    container.innerHTML = html;
    this.renderSummary(filtered);
  },

  renderSummary(entries) {
    const summary = document.getElementById('summary-section');
    if (!summary) return;

    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};
    entries.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const uniqueCountries = [...new Set(entries.map(e => e.country))].length;
    const uniqueCities = [...new Set(entries.map(e => `${e.country}-${e.city}`))].length;

    summary.innerHTML = `
      <div class="summary-card">
        <div class="summary-stat">
          <span class="stat-label">Total Entries</span>
          <span class="stat-value">${entries.length}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">Countries</span>
          <span class="stat-value">${uniqueCountries}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">Cities</span>
          <span class="stat-value">${uniqueCities}</span>
        </div>
        <div class="summary-stat highlight">
          <span class="stat-label">Total Spent</span>
          <span class="stat-value">$${total.toFixed(2)}</span>
        </div>
      </div>
      ${topCategories.length > 0 ? `
        <div class="top-categories">
          <h4>Top Categories</h4>
          <div class="category-bars">
            ${topCategories.map(([cat, amt]) => `
              <div class="category-bar-item">
                <span class="cat-name">${cat}</span>
                <div class="cat-bar">
                  <div class="cat-bar-fill" style="width: ${Math.round((amt / total) * 100)}%"></div>
                </div>
                <span class="cat-amount">$${amt.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  },

  clearFilters() {
    const filterCountry = document.getElementById('filter-country');
    const filterCity = document.getElementById('filter-city');
    const filterCategory = document.getElementById('filter-category');

    if (filterCountry) filterCountry.value = '';
    if (filterCity) {
      filterCity.value = '';
      filterCity.disabled = true;
      filterCity.innerHTML = '<option value="">All Cities</option>';
    }
    if (filterCategory) filterCategory.value = '';

    this.renderLogs();
  },

  exportCSV() {
    const filtered = this.getFilteredData();
    if (filtered.length === 0) {
      this.showNotification('No data to export.', 'info');
      return;
    }

    const headers = ['Date', 'Country', 'City', 'Category', 'Amount', 'Currency', 'Note'];
    const rows = filtered.map(e => [
      e.date,