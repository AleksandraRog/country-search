export interface CountryDto {
  name: string;
  topLevelDomain: string[];
  alpha2Code: string;
  alpha3Code: string;
  callingCodes: string[];
  capital: string;
  altSpellings: string[];
  subregion: string;
  region: string;
  population: number;
  latlng: number[];
  demonym: string;
  area: number;
  timezones: [string];
  borders: string[];
  nativeName: string;
  numericCode: string;
  flags: FlagsDto;
  currencies: CurrencyDto[];
  languages: LanguageDto[];
  flag: string;
  maps: MapsDto;
  populationDensity: number;
}

export interface LanguageDto {
  iso639_1: string;
  iso639_2: string;
  name: string;
  nativeName: string;
}

export interface FlagsDto {
  svg: string;
  png: string;
}

export interface CurrencyDto {
  code: string;
  name: string;
  symbol: string;
}

export interface MapsDto {
  googleMaps: string;
  openStreetMaps: string;
}
