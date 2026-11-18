import {CountryDto} from '../data/Entities';
import {HttpError} from '../data/HttpError';
import storage from '../data/storage';
import {CountryCart} from './Country';
import {debounce} from './debounce';
import {FullCart} from './FullCartCountry';
import {mapCountryResponse} from './mapCountryResponse';
import {mapFullCartResponse} from './mapFullCartResponse';
import {searchCountries} from './searchCountries';

export type SearchHistoryCache = Record<string, FullCart[]>;

export class SearchController {
  public onIdle: () => void = () => {};
  public onLoading: (loading: boolean) => void = () => {};
  public onResults: (results: CountryCart[]) => void = () => {};
  public onEmpty: (query: string) => void = () => {};
  public onEmptyRequest: (history: SearchHistoryCache) => void = () => {};

  public onError: (error: Error) => void = () => {};

  public onTimeoutError: () => void = () => {};
  public onHttpError: (error: HttpError) => void = () => {};
  public onNetworkError: (error: Error) => void = () => {};

  private controller: AbortController | null = null;
  private lastCompletedQuery = '';
  private readonly debouncedFetch: ((query: string) => void) & {cancel: () => void};
  private history: SearchHistoryCache = {};
  constructor(
    delay = 400,
    private readonly timeout = 5000,
  ) {
    this.debouncedFetch = debounce((query: string) => {
      void this.executeSearch(query);
    }, delay);
  }

  public onEditText = (rawQuery: string): void => {
    const query = rawQuery.trim();
    this.cancel();

    if (!query) {
      this.lastCompletedQuery = '';
      const history = this.getHistory();
      this.onEmptyRequest(history);
      return;
    }
    if (query === this.lastCompletedQuery) {
      return;
    }

    this.debouncedFetch(query);
  };

  private executeSearch(query: string) {
    const currentAbortController = new AbortController();
    this.controller = currentAbortController;
    const timeoutSignal = AbortSignal.timeout(this.timeout);
    const signal = AbortSignal.any([currentAbortController.signal, timeoutSignal]);
    this.onLoading(true);

    searchCountries(query, signal)
      .then((data: CountryDto[]) => {
        if (currentAbortController.signal.aborted) return;
        this.lastCompletedQuery = query;

        if (data.length === 0) {
          this.onEmpty(query);
        } else {
          this.history[query] = mapFullCartResponse(data);
          storage.setItem<FullCart[]>('carts', this.history[query]);
          this.onResults(mapCountryResponse(data));
        }
      })
      .catch((error: Error | DOMException) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (currentAbortController.signal.aborted) return;

        this.lastCompletedQuery = '';

        if (error instanceof DOMException && error.name === 'TimeoutError') {
          this.onTimeoutError();
          return;
        }
        if (error instanceof HttpError) {
          this.onHttpError(error);
          return;
        }
        const err = error instanceof Error ? error : new Error('Ошибка сети');
        this.onNetworkError(err);
      })
      .finally(() => {
        if (this.controller === currentAbortController) {
          this.controller = null;
          this.onLoading(false);
        }
      });
  }

  getHistory() {
    return this.history;
  }

  cancel(): void {
    this.debouncedFetch.cancel();
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
      this.onLoading(false);
    }
  }
}
