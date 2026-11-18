import '../../style.css';

import storage from '../../data/storage';
import {FullCart} from '../../domain/FullCartCountry';
import {createView, renderView} from '../utils';
import type {View} from '../view';

const params = new URLSearchParams(window.location.search);

export function createCountryDetailView(data: FullCart): View {
  const backButton = createView('a.back-btn', {
    text: '← Назад к поиску',
    attrs: {href: 'index.html'},
  });

  const detailVisual = createView('aside.detail-visual')([
    createView('img.detail-flag', {
      attrs: {
        src: data.flagUrl,
        alt: `${data.name} flag`,
      },
    }),
    createView('.map-actions')([
      createView('a.map-btn', {
        text: 'Google Maps ↗',
        attrs: {href: data.googleMapsUrl, target: '_blank'},
      }),
      createView('a.map-btn', {
        text: 'OpenStreetMap ↗',
        attrs: {href: data.openStreetMapUrl, target: '_blank'},
      }),
    ]),
  ]);

  const detailHeader = createView('.detail-header')([
    createView('h1.detail-title', {
      text: `${data.flagEmoji} ${data.name}`,
    }),
    createView('p.detail-subtitle', {
      text: `${data.nativeName} • ${data.subregion}, ${data.region}`,
    }),
  ]);

  const kpiItems = [
    {label: 'Население', value: data.population.toLocaleString('ru-RU')},
    {label: 'Площадь', value: data.area},
    {label: 'Плотность', value: data.density},
  ];

  const kpiGrid = createView('.kpi-grid')(
    kpiItems.map(({label, value}) =>
      createView('.kpi-box')([createView('.kpi-label', {text: label}), createView('.kpi-value', {text: `${value}`})]),
    ),
  );

  const specItems = [
    {label: 'Столица (Capital)', value: data.capital},
    {label: 'Демоним (Demonym)', value: data.demonym},
    {label: 'Языки (Languages)', value: data.languages.join(', ') || '—'},
    {label: 'Валюта (Currencies)', value: data.currencies},
    {label: 'Коды ISO / Цифровой', value: data.isoCodes},
    {label: 'Домен и телефонный код', value: data.domainAndPhone},
    {label: 'Координаты (Lat / Lng)', value: data.coordinates},
    {label: 'Часовой пояс', value: data.timezones},
  ];

  const specsCard = createView('.specs-card')([
    createView('.specs-grid')(
      specItems.map(({label, value}) =>
        createView('.spec-item')([
          createView('span.spec-label', {text: label}),
          createView('span.spec-value', {text: `${value}`}),
        ]),
      ),
    ),
  ]);

  const borderTags = data.borders.map((borderCode) =>
    createView('a.tag-pill', {
      text: borderCode,
      attrs: {href: `#${borderCode}`},
    }),
  );

  const tagsSection = createView('.tags-section')([
    createView('span.spec-label', {
      text: 'Граничит с:',
      attrs: {style: 'margin-right: 0.5rem'},
    }),
    ...borderTags,
  ]);

  const mainContent = createView('main')([detailHeader, kpiGrid, specsCard, tagsSection]);

  const detailLayout = createView('.detail-layout')([detailVisual, mainContent]);

  return createView('.container')([backButton, detailLayout]);
}

const rootCart = document.querySelector('body');

async function renderFullCart() {
  const history: FullCart[] = await storage.getItem('carts');
  const data: FullCart | undefined = history?.find((cart: FullCart) => cart.name === params.get('name'));
  if (data) rootCart?.replaceChildren(renderView(createCountryDetailView(data)));
}

renderFullCart();
