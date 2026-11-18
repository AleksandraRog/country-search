import {debounce} from '../src/domain/debounce';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('не вызывает функцию сразу и запускает её только после истечения delay', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced('Israel');

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('сбрасывает таймер при повторном вызове до истечения delay', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced('Is');
    jest.advanceTimersByTime(200);

    debounced('Isr');
    jest.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();

    debounced('Israel');
    jest.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('Israel');
  });

  it('передаёт все аргументы последнего вызова', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);

    debounced('query', 42, {active: true});

    jest.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledWith('query', 42, {active: true});
  });

  it('вызывает функцию повторно после завершения предыдущего таймера', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);

    debounced('first');
    jest.advanceTimersByTime(200);

    debounced('second');
    jest.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'first');
    expect(fn).toHaveBeenNthCalledWith(2, 'second');
  });

  it('сохраняет контекст вызова this', () => {
    const obj = {
      value: 'Israel',
      fn() {
        return this.value;
      },
    };

    const spy = jest.fn(obj.fn);
    const debounced = debounce(spy, 200);

    debounced.call(obj);

    jest.advanceTimersByTime(200);
    expect(spy).toHaveReturnedWith('Israel');
  });

  it('вызывает функцию только один раз при нескольких быстрых вызовах', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced(1);
    debounced(2);
    debounced(3);
    debounced(4);

    jest.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(4);
  });

  it('вызывает функцию после нулевой задержки', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 0);

    debounced();

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(0);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
