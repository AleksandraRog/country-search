import type {CountryDto, LanguageDto} from '../src/data/Entities';
import {CountryCart} from '../src/domain/Country';
import {mapCountryResponse} from '../src/domain/mapCountryResponse';
import countries from './country.json';

const fixtures: CountryDto[] = countries as CountryDto[];

describe('mapCountryResponse', () => {
  const israelRawFixture: CountryDto = {
    name: 'Israel',
    capital: 'Jerusalem',
    region: 'Asia',
    population: 9216900,
    flags: {
      svg: 'https://example.com',
      png: 'https://example.com',
    },
    languages: [
      {iso639_1: 'he', name: 'Hebrew', nativeName: 'עברית'} as LanguageDto,
      {iso639_1: 'ar', name: 'Arabic', nativeName: 'العربية'} as LanguageDto,
    ],
  } as CountryDto;

  it('корректно преобразует полный объект страны в модель карточки', () => {
    const [result] = mapCountryResponse([israelRawFixture]);

    expect(result).toEqual({
      name: 'Israel',
      flag: 'https://example.com',
      capital: 'Jerusalem',
      region: 'Asia',
      population: 9216900,
      languages: ['Hebrew', 'Arabic'],
    });
  });

  it('корректно обрабатывает отсутствие необязательных полей (столица, языки, svg-флаг)', () => {
    const antarcticaFixture = {
      name: 'Antarctica',
      region: 'Polar',
      population: 1000,
      flags: {png: 'https://example.com'},
    } as CountryDto;

    const [result] = mapCountryResponse([antarcticaFixture]);

    expect(result).toEqual({
      name: 'Antarctica',
      flag: 'https://example.com',
      capital: '—',
      region: 'Polar',
      population: 1000,
      languages: [],
    });
  });

  describe('преобразование списка фикстур из country.json', () => {
    it.each(fixtures)('преобразует $name в CountryCart', (raw) => {
      const [result] = mapCountryResponse([raw]);

      expect(result).toBeInstanceOf(CountryCart);
      expect(result.name).toBe(raw.name);
      expect(result.flag).toBe(raw.flags.svg || raw.flags.png);
      expect(result.capital).toBe(raw.capital || '—');
      expect(result.region).toBe(raw.region);
      expect(result.population).toBe(raw.population);
      expect(result.languages).toEqual((raw.languages ?? []).map(({name}) => name));
    });
  });
});
