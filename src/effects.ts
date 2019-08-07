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

export function fromPromise<Action>(
  promise: () => Promise<Action>
): Effect<Action> {
  return [dispatch => promise().then(dispatch)];
}

export function fromFunction<Action>(
  f: (dispatch: Dispatch<Action>) => void
): Effect<Action> {
  return [f];
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
