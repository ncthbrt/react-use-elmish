import { Effect, Dispatch } from "./index";

export function none<Action>(): Effect<Action> {
  return [];
}

export function delay<Action>(action: Action, delay: number): Effect<Action> {
  return [dispatch => setTimeout(() => dispatch(action), delay)];
}

export function action<Action>(action: Action): Effect<Action> {
  return [dispatch => dispatch(action)];
}

export function fromPromise<Action, Value = unknown, Err = Error>(
  promise: () => Promise<Value>,
  ofSuccess: (value: Value) => Action,
  ofError: (error: Err) => Action
): Effect<Action> {
  return effectFromPromise<Action, Value, Err>(promise, ofSuccess, ofError)
}

export function attemptPromise<Action, Value = unknown, Err = Error>(
  promise: () => Promise<Value>,
  ofError: (error: Err) => Action
): Effect<Action> {
  return effectFromPromise<Action, Value, Err>(promise, ofError)
}

export function effectFromPromise<Action, Value, Err>(
  promise: () => Promise<Value>,
  ofSuccess: ((value: Value) => Action) | ((error: Err) => Action),
  ofError?: (error: Err) => Action
): Effect<Action> {
  const handleError = ofError === undefined
    ? ofSuccess as ((error: Err) => Action)
    : ofError

  const handleSuccess = ofError === undefined
    ? undefined
    : ofSuccess as ((value: Value) => Action)

  return [
    (dispatch: Dispatch<Action>) => (
      promise()
        .then(value => {
          if (handleSuccess !== undefined) {
            dispatch(handleSuccess(value))
          }
        })
        .catch(error => {
          dispatch(handleError(error))
        })
    )
  ];
}

export function fromFunction<Action, Value = unknown, Err = Error>(
  f: () => Value,
  ofSuccess: (value: Value) => Action,
  ofError: (error: Err) => Action
): Effect<Action> {
  return effectFromFunction<Action, Value, Err>(f, ofSuccess, ofError)
}

export function attemptFunction<Action, Value = unknown, Err = Error>(
  f: () => Value,
  ofError: (error: Err) => Action
): Effect<Action> {
  return effectFromFunction<Action, Value, Err>(f, ofError)
}

function effectFromFunction<Action, Value, Err>(
  f: () => Value,
  ofSuccess: ((value: Value) => Action) | ((error: Err) => Action),
  ofError?: (error: Err) => Action
): Effect<Action> {
  const handleError = ofError === undefined
    ? ofSuccess as ((error: Err) => Action)
    : ofError

  const handleSuccess = ofError === undefined
    ? undefined
    : ofSuccess as ((value: Value) => Action)

  return [
    (dispatch: Dispatch<Action>) => {
      try {
        const value = f()

        if (handleSuccess !== undefined) {
          dispatch(handleSuccess(value))
        }
      } catch (error) {
        dispatch(handleError(error))
      }
    }
  ];
}

export function fromIterator<Action, I extends Iterable<Action>>(
  iterator: Iterable<Action>
): Effect<Action> {
  return [
    dispatch => {
      for (const action of iterator) {
        dispatch(action);
      }
    }
  ];
}

export function combine<Action>(...effects: Effect<Action>[]): Effect<Action> {
  return effects.reduce(
    (prev, effect: Effect<Action>) => [...prev, ...effect],
    []
  );
}
