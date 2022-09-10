class Countries {
  constructor(selector) {
    this.el = document.querySelector(selector);
    this.searchBar = this.el.querySelector('.search');
    this.dropdown = this.el.querySelector('.custom-select__dropdown');
    this.countriesContainer = this.el.querySelector('.countries-container');
    this.dayNightBtn = this.el.querySelector('.header__mode');
    this.modal = this.el.querySelector('.modal');

    this.#setup();
  }

  #setup() {
    document.addEventListener('DOMContentLoaded', this.checkDayNight.bind(this));
    document.addEventListener('DOMContentLoaded', this.fetchCountries.bind(this));
    this.countriesContainer && this.countriesContainer.addEventListener('click', this.handleCard.bind(this));
    this.modal && this.modal.addEventListener('click', this.handleCloseModal.bind(this));
    this.searchBar && this.searchBar.addEventListener('input', this.filterName.bind(this));
    this.dropdown && this.dropdown.addEventListener('change', this.handleDropdown.bind(this));
    this.dayNightBtn && this.dayNightBtn.addEventListener('click', this.handleDayNight.bind(this));
  }

  fetchCountries() {
    const url = 'https://restcountries.com/v3.1/all';

    fetch(url)
      .then((data) => data.json())
      .then((data) => this.renderCountries(data))
      .catch((err) => {
        alert('Unable to fetch all countries');
        console.log(err);
      });
  }

  handleDayNight() {
    this.el.classList.toggle('_dark');

    const isNightMode = this.el.classList.contains('_dark');

    this.dayNightBtn.children[0].className = isNightMode ? 'fa-solid fa-sun' : ' fa-solid fa-moon';
    this.dayNightBtn.children[1].textContent = isNightMode ? 'Light Mode' : ' Dark Mode';
    this.dayNightState = isNightMode ? 'night' : 'day';

    localStorage.setItem('countries', JSON.stringify({ state: this.dayNightState }));
  }

  checkDayNight() {
    !localStorage.getItem('countries')
      ? (this.dayNightState = 'day')
      : (this.dayNightState = JSON.parse(localStorage.getItem('countries')).state);

    if (this.dayNightState === 'night') {
      this.el.classList.add('_dark');
      this.dayNightBtn.children[0].className = 'fa-solid fa-sun';
      this.dayNightBtn.children[1].textContent = 'Light Mode';
    }
  }

  renderCountries(data) {
    this.countriesContainer.innerHTML = '';

    data.forEach((obj) => {
      this.countriesContainer.innerHTML += `
      <div class="country" data-country="${obj.name.common}">
        <div class="country__img-container">
          <img class="country__bubble" src="${obj.flags.svg}" alt="${obj.name.common} flag" />
        </div>
        <div class="country__info-container">
          <h3 class="country__name">${obj.name.common}</h3>
          <p class="country__bubble"><strong class="country__bubble">Popolation: </strong>${obj.population}</p>
          <p class="country__region"><strong class="country__bubble">Region: </strong>${obj.region}</p>
          <p class="country__bubble"><strong class="country__bubble">Capital: </strong>${obj.capital}</p>
        </div>
      </div>
    `;
    });
  }

  handleCard(e) {
    const { target } = e;

    if (![...target.classList].toString().includes('country')) {
      return;
    }

    const card = target.closest('[data-country]');
    const url = `https://restcountries.com/v3.1/name/${card.dataset.country}`;

    fetch(url)
      .then((data) => data.json())
      .then((data) => this.fillModal(data))
      .catch((err) => {
        alert('Unable to fetch exact country');
        console.log(err);
      });

    if (this.modal.classList.contains('hidden')) {
      this.modal.classList.remove('hidden');
    }

    if (!document.body.classList.contains('scroll-lock')) {
      document.body.classList.add('scroll-lock');
    }
  }

  fillModal(data) {
    let currencies = '';
    let languages = '';

    for (let i = 0, len = Object.keys(data[0].currencies).length; i < len; i++) {
      let key = Object.keys(data[0].currencies)[i];

      if (i === len - 1) {
        currencies += key;
      } else {
        currencies += `${key}, `;
      }
    }

    for (let i = 0, len = Object.keys(data[0].languages).length; i < len; i++) {
      let key = Object.keys(data[0].languages)[i];

      if (i === len - 1) {
        languages += key;
      } else {
        languages += `${key}, `;
      }
    }

    this.modal.innerHTML = `
      <button class="modal__close-btn">Back</button>
      <div class="modal__flex-container">
        <div class="modal__img-container">
          <img data-modal="flag" src="${data[0].flags.svg}" alt="flag" />
        </div>
        <div class="modal__info-container">
          <h2 data-modal="name">${data[0].name.official}</h2>
          <div class="modal__flex-container">
            <div class="modal__info-column">
              <p><strong>Pupulation: </strong> <span data-modal="population">${data[0].population}</span></p>
              <p><strong>Region: </strong> <span data-modal="region">${data[0].region}</span></p>
              <p><strong>Capital: </strong> <span data-modal="capital">${data[0].capital}</span></p>
            </div>
            <div class="modal__info-column">
              <p><strong>Currencies: </strong> <span data-modal="currencies">${currencies}</span></p>
              <p><strong>Top Level Domain: </strong> <span data-modal="domain">${data[0].tld[0]}</span></p>
              <p><strong>Languages: </strong> <span data-modal="languages">${languages}</span></p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  handleCloseModal(e) {
    const { target } = e;

    if (!target.classList.contains('modal__close-btn')) {
      return;
    }

    if (!this.modal.classList.contains('hidden')) {
      this.modal.classList.add('hidden');
    }

    if (document.body.classList.contains('scroll-lock')) {
      document.body.classList.remove('scroll-lock');
    }

    this.modal.innerHTML = `
      <button class="modal__close-btn">Back</button>
    `;
  }

  filterName() {
    const allCountryNames = [...this.el.querySelectorAll('.country__name')];
    const nameValue = this.searchBar.value.trim().toLowerCase();

    allCountryNames.forEach((name) => {
      const grandParent = name.parentElement.parentElement;

      if (!name.textContent.toLowerCase().includes(nameValue)) {
        if (!grandParent.classList.contains('hidden')) {
          grandParent.classList.add('hidden');
        }
      } else {
        if (grandParent.classList.contains('hidden')) {
          grandParent.classList.remove('hidden');
        }
      }
    });
  }

  handleDropdown(e) {
    const { target } = e;
    const value = target.value;
    const urlRegion = `https://restcountries.com/v3.1/region/${value}`;
    const urlAll = 'https://restcountries.com/v3.1/all';

    this.countriesContainer.innerHTML = `<h2>Loading...</h2>`;

    fetch(value === 'all' ? urlAll : urlRegion)
      .then((data) => data.json())
      .then((data) => this.renderCountries(data))
      .then(this.filterName.bind(this))
      .catch((err) => {
        alert('Unable to fetch countries for particular region');
        console.log(err);
      });
  }
}

const countries = new Countries('.wrapper');
