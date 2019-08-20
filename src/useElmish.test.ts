import { renderHook, act } from "@testing-library/react-hooks";
import useElmish, { Effects } from "./index";
import { render } from "react-dom";

test("should act as a reducer", () => {
  const { result } = renderHook(() =>
    useElmish(
      (prev, action) => {
        if (action == "increment") {
          return [prev + 1, Effects.none()];
        } else {
          return [prev, Effects.none()];
        }
      },
      () => [0, Effects.none()]
    )
  );

  act(() => {
    result.current[1]("increment");
  });

  expect(result.current[0]).toBe(1);
});

test("should execute effects", async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useElmish(
      (prev, action) => {
        if (action == "startSinging") {
          return [{ state: "singing" }, Effects.action("stopSinging")];
        } else if (action == "stopSinging") {
          return [{ state: "stoppedSinging" }, Effects.none()];
        } else {
          return [prev, Effects.none()];
        }
      },
      () => [{ state: "notStartedSinging" }, Effects.none()]
    )
  );

  act(() => {
    result.current[1]("startSinging");
  });

  expect(result.current[0].state).toBe("stoppedSinging");
});

test("should not trigger rerender if no effects and state the same", async () => {
  let renderCount = 0;
  const { result } = renderHook(() => {
    ++renderCount;
    return useElmish(
      (prev, action) => {
        if (action == "increment") {
          return [prev + 1, Effects.none()];
        } else {
          return [prev, Effects.none()];
        }
      },
      () => [0, Effects.none()]
    );
  });

  act(() => {
    result.current[1]("other");
  });

  expect(result.current[0]).toBe(0);
  expect(renderCount).toBe(1);
});




test("initial effects should be executed", async () => {
  let renderCount = 0;
  const { result } = renderHook(() => {
    ++renderCount;
    return useElmish(
      (prev, action) => {
        if (action == "increment") {
          return [prev + 1, Effects.none()];
        } else {
          return [prev, Effects.none()];
        }
      },
      () => [0, Effects.action('increment')]
    );
  });  

  expect(result.current[0]).toBe(1);
});