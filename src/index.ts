import React, { useCallback } from "react";
import { useReducer, useEffect } from "react";

import * as Effects from "./effects";
export type Dispatch<A> = (value: A) => void;
export type Effect<Action> = Array<(dispatch: Dispatch<Action>) => void>;
export type StateEffectPair<State, Action> = [State, Effect<Action>];
export type Reducer<State, Action> = (
  prevState: State,
  action: Action
) => StateEffectPair<State, Action>;

// types used to try and prevent the compiler from reducing S
// to a supertype common with the second argument to useReducer()
export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<
  infer S,
  any
>
  ? S
  : never;
export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<
  any,
  infer A
>
  ? A
  : never;
export type ReducerStateEffectPair<
  R extends Reducer<any, any>
> = R extends Reducer<infer S, infer A> ? [S, Effect<A>] : never;

const removeEffects = 0;
const domainAction = 1;

type EffectAction<Action> =
  | [0 /* Remove effects */, Effect<Action>]
  | [1 /* Domain action */, Action];

type EffectReducerAction<R extends Reducer<any, any>> = R extends Reducer<
  any,
  infer A
>
  ? EffectAction<A>
  : never;

function throwIfNotNever(x: never) {
  if (!!x) {
    throw new TypeError(`Expected value ${x} to be of type "never"`);
  }
  return x;
}

function makeElmishReducer<R extends Reducer<any, any>>(reducer: R) {
  return ([prevState, prevEffects]: ReducerStateEffectPair<R>, action: EffectReducerAction<R>) => {
    switch (action[0]) {
      case 0: {
        const nextEffects = prevEffects.filter(x => !action[1].includes(x));
        return [prevState, nextEffects] as ReducerStateEffectPair<R>;
      }
      case 1: {
        const [nextState, newEffects] = reducer(prevState, action[1]);
        return [
          nextState,
          [...prevEffects, ...newEffects]
        ] as ReducerStateEffectPair<R>;
      }
      default: {
        return throwIfNotNever(action[0]);
      }
    }
  }
}

export function useElmish<R extends Reducer<any, any>>(
  reducer: R,
  initializer: () => ReducerStateEffectPair<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
  const memoizedReducer = useCallback(makeElmishReducer(reducer), [reducer]);
  const [[state, effects], dispatch] = useReducer(
    memoizedReducer,
    null,
    initializer
  );
  
  const subDispatch = React.useCallback((action: ReducerAction<R>) =>
    dispatch([domainAction, action] as EffectReducerAction<R>), [dispatch]
  );

  useEffect(() => {
    if (effects.length > 0) {
      const eff = [...effects];
      dispatch([removeEffects, eff] as EffectReducerAction<R>);
      eff.forEach(x => x(subDispatch));
    }
  }, [effects]);

  return [state, subDispatch];
}

export { Effects };

export default useElmish;
