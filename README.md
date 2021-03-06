
# react-use-elmish

A React hook for unified purely-functional state and effect management.

[![Coverage Status](https://coveralls.io/repos/github/ncthbrt/react-use-elmish/badge.svg?branch=master)](https://coveralls.io/github/ncthbrt/react-use-elmish?branch=master) ![GitHub](https://img.shields.io/github/license/ncthbrt/react-use-elmish) ![npm](https://img.shields.io/npm/v/react-use-elmish)

## What is it?

Inspired by F#'s Elmish library, which was in turn inspired by the Elm architecture, react-use-elmish
is a small react-hook for js and typescript, which combines `useReducer` and `useEffect` into a unified hook that just works™️.

The main difference is instead of simply returning the next state in your reducer, you _also_ return a set of side effects. These side effects are executed in a `useEffect`.

Here is a simple example which every second alternates the state between 'TICK' and 'TOCK':

```javascript
import useElmish, { Effects } from "react-use-elmish";

const [state, dispatch] = useElmish(
  (state, action) => {
    if (action === "INCREMENT_CLOCK") {
      return [
        state === "TICK" ? "TOCK" : "TICK",
        Effects.delay("INCREMENT_CLOCK", 1000)
      ];
    }
    return [state, Effects.none()];
  },
  /*initialState: */ () => ["TICK", Effects.action("INCREMENT_CLOCK")]
);
```

## Why is it?

`Redux` and the `useReducer` hook are a great pattern for performing application state management. However they leave it as an exercise to the reader to implement or integrate an effects system (such as `redux-thunk`, `redux-saga` or `redux-observable`). The downside with this approach is that your effects and state management are quite decoupled. In some approaches, the side effect system has to observe the state and trigger effects based on changes to the state, in others you have to remember to call an 'action creator' which performs the effect and dispatches events to the store as it goes along. These other approaches to effect management are often in some ways quite semantically awkward. You dispatch 'actions', not 'events', yet your reducer handles these 'actions' as though they have happened, instead of being an earnest request to do the actual thing.

The Elmish architecture takes an alternative approach. When you dispatch an action, it is treated as a true action. It is a thing that the application _wants_ to happen. The reducer schedules side-effects if the action requires it (but doesn't execute the action itself, making the reducer still stateless). This greatly increases the cohesiveness of your application, and reduces a certain amount of boilerplate.

The hook makes care not to trigger redraws if the state is unchanged and no side-effects have been scheduled. 

## Installing

NPM:

```
  npm install --save react-use-elmish
```

Yarn:

```
  yarn add react-use-elmish
```

## Included effect creators:

`react-use-elmish` comes with a few built in effects. These are:

`none()`: Not really an effect, rather a lack of one.

`delay(action: Action, delay: number)`: Dispatches `action` to the reducer `delay` milliseconds in the future.

`action(action: Action)` : Dispatches `action` to the reducer, immediately after this reducer has returned.

`fromPromise(promise: () => Promise<Value>, ofSuccess: Value => Action, ofError: Error => Action)`: Waits for a promise to resolve and then maps the success or error cases to an action and dispatches it. 

`dispatchFromPromise(promise: () => Promise<Action>, ofError: Error => Action)`: Waits for a promise to resolve and then dispatches the returned action. If an error, maps the error to an action and dispatches it. 

`attemptPromise(() => Promise<any>, ofError: Error => Action)`: Attempts to resolve the promise and ignores the result. Dispatches an action on failure. 

`dispatchFromFunction(f: () => Action, ofError: Error => Action)`: Attempts to run the provided function and dispatch the result. On error, invokes the error action creator. 

`fromFunction(f: () => Value, ofSuccess: Value => Action, ofError: Error => Action)`: Attempts to run the provided function and  and then maps the success or error results to an action and dispatches it. 

`attemptFunction(f: () => Value, ofError: Error => Action)`: Attempts to run the function to completion, ignoring the result. Dispatches an action on failure. 

`fromIterator(iterable)`: Dispatches each item in the iterable collection in order.

`combine(...effects)`: Combines effects toghether. Effects are scheduled in order.

## Writing your own effects

While the included effect creators should serve many purposes, it is quite easy to write your own side effect creator.
Side effects are simply an array of void returning functions which take in a dispatcher as their only argument.

Fore example `none` is defined as:

```javascript
const none = () => [];
```

`delay` is defined as:

```javascript
const delay = (action, ms) => [
  dispatch => setTimeout(() => dispatch(action), ms)
];
```

## Ecosystem
[React Elmish Router](https://github.com/ncthbrt/react-elmish-router)
