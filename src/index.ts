import React from "react";
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

const addEffects = 0;
const removeEffects = 1;
type EffectReducerAction<Action> =
  | [0 /* Add effects */, Effect<Action>]
  | [1 /* Remove effects */, Effect<Action>];


export function useElmish<R extends Reducer<any, any>, I>(
  reducer: R,
  initializer: () => ReducerStateEffectPair<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
  const [effects, effectsDispatch] = useReducer(
    (
      prev: Effect<ReducerAction<R>>,
      [actionType, effects]: EffectReducerAction<ReducerAction<R>>
    ) => {
      switch (actionType) {
        case 0:
          return ([] as Effect<ReducerAction<R>>).concat(prev, effects);
        case 1:
          return prev.filter(x => !effects.includes(x));        
      }
    },
    []
  );

  const [state, dispatch] = useReducer(
    (prevState, action) => {
      let [nextState, nextEffects] = reducer(prevState, action);
      if (nextEffects.length > 0) {
        effectsDispatch([addEffects, nextEffects]);
      }
      return nextState;
    },
    null,
    _ => {
      const [state, eff] = initializer();      
      if (eff.length > 0) {
        effectsDispatch([addEffects, eff]);
      }
      return state;
    }
  );

  useEffect(() => {
    if (effects.length > 0) {
      const eff = [...effects];
      effectsDispatch([removeEffects, eff]);
      eff.forEach((x: (dispatch: Dispatch<ReducerAction<R>>) => void) =>
        x(dispatch)
      );
    }
  });

  return [state, dispatch];
}

export { Effects };

export default useElmish;
