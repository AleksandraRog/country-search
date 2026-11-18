import {CountryCart} from 'src/domain/Country';

import {createView} from './utils';
import {View} from './view';

export function createCountryCart(country: CountryCart): View {
  return createView('a.country-card', {
    attrs: {
      href: `cart.html?name=${encodeURIComponent(country.name)}`,
    },
  })([
    createView('div.card-flag-wrapper')([
      createView('img', {
        attrs: {
          src: country.flag,
          alt: `Flag of ${country.name}`,
        },
      }),
    ]),
    createView('div.card-body')([
      createView('div.card-title-row')([
        createView('h2.card-title', {
          text: country.name,
        }),
        createView('span.card-native', {
          text: country.nativeName ?? '',
        }),
      ]),
      createView('span.card-region-badge', {
        text: `${country.region} • ${country.subregion}`,
      }),
      createView('ul.card-meta')([
        createView('li')([createView('span', {text: 'Столица:'}), createView('strong', {text: country.capital})]),
        createView('li')([
          createView('span', {text: 'Население:'}),
          createView('strong', {
            text: country.population.toLocaleString('ru-RU'),
          }),
        ]),
      ]),
    ]),
  ]);
}
