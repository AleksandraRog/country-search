import './style.css';

import {CountryCart} from './domain/Country';
import {SearchController} from './domain/SearchController';
import {createCountryCart} from './ui/createCountryCard';
import {createView, renderView} from './ui/utils';

const searchInput = renderView<HTMLInputElement>(
  createView('input.search-input', {
    attrs: {
      type: 'text',
      placeholder: 'Поиск по названию...',
    },
  }),
);

const searchIcon = createView('span.search-icon', {
  text: '🔍',
});

const searchSpinner = createView('span.search-spinner', {
  attrs: {
    'aria-label': 'Загрузка',
  },
});

const searchBox = renderView<HTMLDivElement>(createView('div.search-box')([searchIcon, searchInput, searchSpinner]));

const regions = [
  {value: '', text: 'Все регионы'},
  {value: 'Asia', text: 'Asia'},
  {value: 'Europe', text: 'Europe'},
  {value: 'Africa', text: 'Africa'},
  {value: 'Americas', text: 'Americas'},
  {value: 'Oceania', text: 'Oceania'},
];

const filterSelect = createView('select.filter-select')(
  regions.map(({value, text}) =>
    createView('option', {
      value,
      text,
    }),
  ),
);

const searchHeader = createView('header.search-header')([searchBox, filterSelect]);

const countriesGrid = renderView<HTMLElement>(createView('main.countries-grid'));

const container = renderView<HTMLDivElement>(createView('div.container')([searchHeader, countriesGrid]));

const body = document.querySelector<HTMLBodyElement>('body');
body?.replaceChildren(container);

const searchController = new SearchController();

searchInput.addEventListener('input', (event) => {
  const target = event.currentTarget as HTMLInputElement;
  searchController.onEditText(target.value);
});

searchController.onIdle = () => {
  clearList();
};

searchController.onLoading = (isLoading) => {
  toggleSpinner(isLoading);
};
searchController.onResults = (countries) => {
  renderCards(countries);
};
searchController.onEmpty = () => {
  showEmptyContainer();
};
searchController.onError = () => {
  showErrorMessage();
};

searchController.onTimeoutError = () => {
  showErrorMessage();
};

searchController.onHttpError = (error) => {
  showErrorMessage(error);
};

searchController.onNetworkError = () => {
  showErrorMessage();
};

function toggleSpinner(isLoading: boolean) {
  searchBox.classList.toggle('is-loading', isLoading);
}

function showEmptyContainer() {
  const emptyPlaceholder = renderView<HTMLDivElement>(
    createView('.empty-placeholder')([createView('.empty-message', {text: 'Не найдено'})]),
  );
  countriesGrid.replaceChildren(emptyPlaceholder);
}

function showErrorMessage(error: Error | DOMException = new Error('Ошибка! Попробуйте позднее')) {
  const reloadButton = renderView<HTMLButtonElement>(
    createView('button.replace-button', {
      text: 'Обновить',
      events: {click: onClickUpdate},
    }),
  );
  const errorPlaceholder = renderView<HTMLDivElement>(
    createView('.error-placeholder')([createView('.error-message', {text: `${error.message}`}), reloadButton]),
  );
  countriesGrid.replaceChildren(errorPlaceholder);
}

function renderCards(countries: CountryCart[]) {
  const carts = countries.map((country) => renderView<HTMLAnchorElement>(createCountryCart(country)));
  countriesGrid.replaceChildren(...carts);
}

function clearList() {
  countriesGrid.replaceChildren();
}

function onClickUpdate() {
  searchController.onEditText(searchInput.value);
}
