import {HttpError} from '../src/data/HttpError';
import {searchCountries} from '../src/domain/searchCountries';

const signal = new AbortController().signal;

describe('searchCountries', () => {
  const originalFetch = global.fetch;
  const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = originalFetch;
  });

  test('returns countries when response is successful', async () => {
    const countries = [{name: 'Germany'}, {name: 'Israel'}];

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(countries), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      }),
    );
    const result = await searchCountries('ger');

    expect(result).toEqual(countries);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/name/ger'), {
      signal: undefined,
    });
  });

  test('returns empty array when response status is 404', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 404,
        headers: {'Content-Type': 'application/json'},
      }),
    );

    await expect(searchCountries('unknown')).resolves.toEqual([]);
  });

  test.each([400, 500, 503])('throws HttpError when response status is %i', async (status) => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        status,
      }),
    );

    await expect(searchCountries('ger')).rejects.toBeInstanceOf(HttpError);

    await expect(searchCountries('ger')).rejects.toMatchObject({
      status,
      name: 'HttpError',
    });
  });

  test('throws network error when fetch fails', async () => {
    const error = new TypeError('Failed to fetch');

    fetchMock.mockRejectedValue(error);

    await expect(searchCountries('ger')).rejects.toBe(error);
  });

  test('propagates AbortError when request is cancelled', async () => {
    const error = new DOMException('Aborted', 'AbortError');

    fetchMock.mockRejectedValue(error);

    await expect(searchCountries('ger')).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  test('propagates TimeoutError when request times out', async () => {
    const error = new DOMException('Timed out', 'TimeoutError');

    fetchMock.mockRejectedValue(error);

    await expect(searchCountries('ger', signal)).rejects.toMatchObject({
      name: 'TimeoutError',
    });
  });

  test('does not parse JSON when response status is 404', async () => {
    const response = new Response(null, {status: 404});
    const jsonSpy = jest.spyOn(response, 'json');

    fetchMock.mockResolvedValue(response);

    await expect(searchCountries('unknown')).resolves.toEqual([]);
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  test('does not parse JSON when response is unsuccessful', async () => {
    const response = new Response(null, {status: 500});
    const jsonSpy = jest.spyOn(response, 'json');

    fetchMock.mockResolvedValue(response);

    await expect(searchCountries('ger')).rejects.toBeInstanceOf(HttpError);

    expect(jsonSpy).not.toHaveBeenCalled();
  });

  test('passes AbortSignal to fetch', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
      }),
    );

    const controller = new AbortController();

    await searchCountries('ger', controller.signal);
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {signal: controller.signal});
  });

  test('does not make a request for an empty query', async () => {
    await expect(searchCountries('', signal)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('does not make a request for a whitespace-only query', async () => {
    await expect(searchCountries('   ', signal)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
