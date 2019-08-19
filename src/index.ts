import React from "react";
import { useReducer, useEffect, useRef } from "react";

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

export function useElmish<R extends Reducer<any, any>, I>(
  reducer: R,
  initializer: () => ReducerStateEffectPair<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
  let effects = useRef<Effect<ReducerAction<R>>>([]);

  let [state, dispatch] = useReducer(
    (prevState, action) => {
      let nextStateAndEffect = reducer(prevState, action);
      effects.current = [...effects.current, ...nextStateAndEffect[1]];
      return nextStateAndEffect[0];      
    },
    null,
    _ => {
      const initialState = initializer();
      
      effects.current = [...initialState[1]];
      return initialState[0];
    }
  );

  useEffect(() => {
    const eff = [...effects.current];
    if(effects.current.length > 0) {      
      effects.current = [];
      eff.forEach((x: (dispatch: Dispatch<ReducerAction<R>>) => void) => x(dispatch));
    }    
  }, [state, effects.current]);

  return [state, dispatch];
}

export { Effects };

export default useElmish;
