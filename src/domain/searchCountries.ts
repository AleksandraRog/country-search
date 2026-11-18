import {CountryDto} from '../data/Entities';
import {HttpError} from '../data/HttpError';

const API_URL = 'https://countries.dev/name';

export async function searchCountries(query: string, signal?: AbortSignal): Promise<CountryDto[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];
  const url = `${API_URL}/${encodeURIComponent(trimmedQuery)}`;
  const response = await fetch(url, {signal});

  if (response.status === 404) return [];

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  return response.json();
}
