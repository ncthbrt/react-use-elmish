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
  test("should return a array containing a single function", async () => {
    const effects = Effects.fromPromise(
      () => Promise.reject("FROG"),
      () => "ERROR ACTION"
    );

    expect(effects[0]).toBeInstanceOf(Function);
    expect(effects).toHaveLength(1);
  });

  test("should invoke provided dispatch once promise has resolved", async () => {
    const action = "BOOTS & CATS";
    const effects = Effects.fromPromise(
      () => Promise.resolve(),
      () => action,
      () => "ERROR ACTION"
    );
    const mockDispatch = jest.fn();
    await effects[0](mockDispatch);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  test("should invoke provided dispatch once promise has rejected", async () => {
    const effects = Effects.fromPromise(
      () => Promise.reject("FROG"),
      () => "ERROR ACTION"
    );
    const mockDispatch = jest.fn();
    await effects[0](mockDispatch);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  test(
    "shouldn't invoke provided dispatch once promise has resolved " +
    "but ofSuccess handler wasn't provided", async () => {
    const effects = Effects.fromPromise(
      () => Promise.resolve("CATS"),
      () => "ERROR ACTION"
    );
    const mockDispatch = jest.fn();
    await effects[0](mockDispatch);
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });
});

describe("fromFunction()", () => {
  test("should return input function in array containing single item", () => {
    const mockFn = jest.fn();
    const effects = Effects.fromFunction(
      mockFn,
      () => "ERROR ACTION"
    );
    expect(effects[0]).toBeInstanceOf(Function);
    expect(effects).toHaveLength(1);
  });

  test("should invoke provided dispatch once function has succeeded", () => {
    const action = "BOOTS & CATS";
    const effects = Effects.fromFunction(
      () => 1 + 2,
      () => action,
      () => "ERROR ACTION"
    );
    const mockDispatch = jest.fn();
    effects[0](mockDispatch);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  test("should invoke provided dispatch once promise has thrown exception", () => {
    const effects = Effects.fromFunction(
      () => { throw "FROG" },
      () => "ERROR ACTION"
    );
    const mockDispatch = jest.fn();
    effects[0](mockDispatch);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  test(
    "shouldn't invoke provided dispatch once function has succeeded " +
    "but ofSuccess handler wasn't provided", () => {
    const effects = Effects.fromFunction(
      () => "CATS",
      () => "ERROR ACTION"
    );
    const mockDispatch = jest.fn();
    effects[0](mockDispatch);
    expect(mockDispatch).toHaveBeenCalledTimes(0);
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

describe("combine()", () => {
  test("should concatenate two effects together", () => {
    const effect1 = Effects.fromIterator([1, 2, 3]);
    const effect2 = Effects.action(4);
    const effects = Effects.combine(effect1, effect2);
    expect(effects[0]).toBeInstanceOf(Function);
    expect(effects[1]).toBeInstanceOf(Function);
    expect(effects).toHaveLength(2);
  });
});
