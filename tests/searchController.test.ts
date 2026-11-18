import {HttpError} from '../src/data/HttpError';
import {SearchController} from '../src/domain/SearchController';
import {searchCountries} from '../src/domain/searchCountries';

jest.mock('../src/domain/searchCountries');
const mockedSearchCountries = jest.mocked(searchCountries);

describe('Логика отмены и различения ошибок при поиске', () => {
  beforeEach(() => {
    AbortSignal.timeout ??= () => new AbortController().signal;
    AbortSignal.any ??= (signals) => signals[0];
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('отменяет предыдущий активный запрос немедленно при новом вводе, не дожидаясь окончания debounce', async () => {
    let capturedSignal: AbortSignal | undefined;

    mockedSearchCountries.mockImplementation((_query, signal) => {
      capturedSignal = signal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    const onTimeoutError = jest.fn();
    const onHttpError = jest.fn();
    const onNetworkError = jest.fn();

    const controller = new SearchController(300);
    controller.onTimeoutError = onTimeoutError;
    controller.onHttpError = onHttpError;
    controller.onNetworkError = onNetworkError;

    controller.onEditText('Isr');
    jest.advanceTimersByTime(300);
    expect(mockedSearchCountries).toHaveBeenCalledTimes(1);
    expect(capturedSignal?.aborted).toBe(false);

    controller.onEditText('Isra');
    expect(capturedSignal?.aborted).toBe(true);

    await Promise.resolve();
    expect(onTimeoutError).not.toHaveBeenCalled();
    expect(onHttpError).not.toHaveBeenCalled();
    expect(onNetworkError).not.toHaveBeenCalled();
  });

  it('вызывает onTimeoutError при истечении времени ожидания', async () => {
    mockedSearchCountries.mockRejectedValue(new DOMException('The operation timed out', 'TimeoutError'));

    const onTimeoutError = jest.fn();
    const controller = new SearchController(300);
    controller.onTimeoutError = onTimeoutError;

    controller.onEditText('Israel');
    await jest.advanceTimersByTimeAsync(300);

    expect(onTimeoutError).toHaveBeenCalledTimes(1);
  });

  it('вызывает onHttpError и передаёт экземпляр HttpError при ошибке сервера', async () => {
    const httpError = new HttpError(500);
    mockedSearchCountries.mockRejectedValue(httpError);

    const onHttpError = jest.fn();
    const controller = new SearchController(300);
    controller.onHttpError = onHttpError;

    controller.onEditText('Israel');
    await jest.advanceTimersByTimeAsync(300);

    expect(onHttpError).toHaveBeenCalledTimes(1);
    expect(onHttpError).toHaveBeenCalledWith(httpError);
  });

  it('вызывает onNetworkError при обрыве сети', async () => {
    const networkError = new TypeError('Failed to fetch');
    mockedSearchCountries.mockRejectedValue(networkError);

    const onNetworkError = jest.fn();
    const controller = new SearchController(300);
    controller.onNetworkError = onNetworkError;

    controller.onEditText('Israel');
    await jest.advanceTimersByTimeAsync(300);

    expect(onNetworkError).toHaveBeenCalledTimes(1);
    expect(onNetworkError).toHaveBeenCalledWith(networkError);
  });
});
