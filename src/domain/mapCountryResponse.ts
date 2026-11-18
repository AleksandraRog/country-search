import {CountryDto} from 'src/data/Entities';

import {CountryCart} from './Country';

export function mapCountryResponse(data: CountryDto[]): CountryCart[] {
  return data.map(
    (raw) =>
      new CountryCart(
        raw.name,
        raw.flags.svg || raw.flags.png || '',
        raw.capital || '—',
        raw.region,
        raw.population,
        raw.nativeName,
        raw.subregion,
        raw.languages?.map(({name}) => name) ?? [],
      ),
  );
}
