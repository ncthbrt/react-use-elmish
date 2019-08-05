import * as Effects from "./effects";

describe("none()", () => {
  test("should be equal to []", () => {
    expect(Effects.none()).toEqual([]);
  });
});

describe("delay()", () => {
  test("should return a array containing a single function", () => {
    const effects = Effects.delay("FROG", 100);
    expect(effects[0]).toBeInstanceOf(Function);
    expect(effects).toHaveLength(1);
  });

  test("should call setTimeout with the specified time", () => {
    jest.useFakeTimers();
    const delay = 100;
    const action = "FROG";
    const delayEffect = Effects.delay(action, delay)[0];
    const mockDispatch = jest.fn();

    delayEffect(mockDispatch);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), delay);
    jest.runAllTimers();
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(action);
  });
});

describe("action()", () => {
  test("should return a array containing a single function", () => {
    const effects = Effects.action("FROG");
    expect(effects[0]).toBeInstanceOf(Function);
    expect(effects).toHaveLength(1);
  });

  test("should call dispatch with the specified action", () => {
    jest.useFakeTimers();
    const action = "SHOEHORN";
    const actionEffect = Effects.action(action)[0];
    const mockDispatch = jest.fn();

    actionEffect(mockDispatch);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(action);
  });
});

describe("fromPromise()", () => {
  test("should return a array containing a single function", () => {
    const effects = Effects.fromPromise(async () => Promise.resolve("FROG"));
    expect(effects[0]).toBeInstanceOf(Function);
    expect(effects).toHaveLength(1);
  });

  test("should invoke provided dispatch once promise has resolved", async () => {
    const action = "BOOTS & CATS";
    const effects = Effects.fromPromise(() => Promise.resolve(action));
    const mockDispatch = jest.fn();
    await effects[0](mockDispatch);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

describe("fromFunction()", () => {
  test("should return input function in array containing single item", () => {
    const mockFn = jest.fn();
    const effects = Effects.fromFunction(mockFn);
    expect(effects[0]).toBe(mockFn);
    expect(effects).toHaveLength(1);
  });
});

describe("fromIterator()", () => {
  test("should return a array containing a single function", () => {
    const effects = Effects.fromIterator([1, 2, 3]);
    expect(effects[0]).toBeInstanceOf(Function);
    expect(effects).toHaveLength(1);
  });

  test("should dispatch each item in iterable array when invoked", () => {
    const effects = Effects.fromIterator([1, 2, 3]);
    const mockDispatch = jest.fn();
    effects[0](mockDispatch);
    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(mockDispatch).toHaveBeenNthCalledWith(1, 1);
    expect(mockDispatch).toHaveBeenNthCalledWith(2, 2);
    expect(mockDispatch).toHaveBeenNthCalledWith(3, 3);
  });
});
