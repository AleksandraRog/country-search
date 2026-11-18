import {CountryDto} from '../data/Entities';
import {FullCart} from './FullCartCountry';

export function mapFullCartResponse(data: CountryDto[]): FullCart[] {
  return data.map(
    (raw) =>
      new FullCart(
        raw.name,
        raw.flags.svg || raw.flags.png || '',
        raw.capital || '—',
        raw.region || '—',
        raw.population ?? '—',
        raw.nativeName,
        raw.subregion || '—',
        raw.languages?.map(({name}) => name) ?? [],
        raw.flag || '',
        raw.flags?.svg || raw.flags?.png || '',
        typeof raw.area === 'number' ? `${raw.area.toLocaleString('ru-RU')} км²` : '—',
        typeof raw.populationDensity === 'number' ? `${raw.populationDensity.toLocaleString('ru-RU')} / км²` : '—',
        raw.demonym,
        raw.currencies?.map(({name, code, symbol}) => `${name} (${code}, ${symbol})`).join(', ') || '—',
        [raw.alpha2Code, raw.alpha3Code, raw.numericCode].filter(Boolean).join(' • ') || '—',
        [raw.topLevelDomain?.[0] ?? '', raw.callingCodes?.[0] ? `+${raw.callingCodes[0]}` : '']
          .filter(Boolean)
          .join(' • ') || '—',
        raw.latlng?.length ? raw.latlng.join(', ') : '—',
        raw.timezones?.join(', ') || '—',
        raw.borders ?? [],
        raw.maps?.googleMaps || '#',
        raw.maps?.openStreetMaps || '#',
      ),
  );
}
