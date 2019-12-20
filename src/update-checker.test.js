import React from "react";
import { Text } from "react-native";
import { render, wait, act } from "@testing-library/react-native";
import { toHaveTextContent } from "@testing-library/jest-native";
import { useUpdateChecker } from "./update-checker";

console.disableYellowBox = true;
expect.extend({ toHaveTextContent });

/**
 * Helpers Functions to pass to useUpdateChecker
 */
const getVersionMock = version => () => version;
const getRemoteVersionTest = (latest, required) => () => ({
  latest,
  required
});
const compareVersionTest = (local, latest, required) => {
  if (local < required) {
    return "required";
  } else if (local >= required && local < latest) {
    return "latest";
  }
  return "none";
};

test("show isChecking", async () => {
  const isCheckingMessage = "Is Checking";
  const isNotCheckingMessage = "Is Not Checking";

  var shouldResolve = false;
  var intervalId;
  const asyncRemoteVersionMock = () => {
    return new Promise((resolve, reject) => {
      intervalId = setInterval(() => {
        if (shouldResolve) {
          clearInterval(intervalId);
          resolve({
            latest: 4,
            required: 3
          });
        }
      }, 0);
    });
  };

  const TestComponent = () => {
    const { isChecking } = useUpdateChecker({
      getLatestAndRequiredVersions: asyncRemoteVersionMock,
      getLocalVersion: getVersionMock(2),
      getUpdateStatus: compareVersionTest
    });

    return (
      <Text testID="test">
        {isChecking ? isCheckingMessage : isNotCheckingMessage}
      </Text>
    );
  };
  const { queryByTestId } = render(<TestComponent />);
  await wait(() =>
    expect(queryByTestId("test")).toHaveTextContent(isCheckingMessage)
  );

  await act(async () => {
    shouldResolve = true;

    await wait(() =>
      expect(queryByTestId("test")).toHaveTextContent(isNotCheckingMessage)
    );
  });
});

test("show error", async () => {
  const errorMessage = "There is error";
  var shouldReturn = false;
  var intervalId;

  const asyncRemoteVersionMock = () => {
    return new Promise((_, reject) => {
      intervalId = setInterval(() => {
        if (shouldReturn) {
          clearInterval(intervalId);
          reject("Error");
        }
      }, 10);
    });
  };

  const TestComponent = () => {
    const { error } = useUpdateChecker({
      getLatestAndRequiredVersions: asyncRemoteVersionMock,
      getLocalVersion: getVersionMock(2),
      getUpdateStatus: compareVersionTest
    });

    return <Text testID="test">{error ? errorMessage : null}</Text>;
  };
  const { queryByTestId } = render(<TestComponent />);

  await act(async () => {
    shouldReturn = true;
    await wait(() =>
      expect(queryByTestId("test")).toHaveTextContent(errorMessage)
    );
  });
});

test("checkNow should update the component", async () => {
  const isUpTodateMessage = "Is Up to date";
  const isErrorMessage = "Is Error";
  var returnError = true;

  const asyncRemoteVersionMock = () => {
    return new Promise((resolve, reject) => {
      if (returnError) {
        reject("Error");
      } else {
        resolve({
          latest: 4,
          required: 1
        });
      }
    });
  };

  var checkNowFunc;

  const TestComponent = () => {
    const { updateState, checkNow, error } = useUpdateChecker({
      getLatestAndRequiredVersions: asyncRemoteVersionMock,
      getLocalVersion: getVersionMock(4),
      getUpdateStatus: compareVersionTest
    });

    checkNowFunc = checkNow;

    return (
      <Text testID="test">
        {updateState === "none"
          ? isUpTodateMessage
          : error
          ? isErrorMessage
          : null}
      </Text>
    );
  };
  const { queryByTestId } = render(<TestComponent />);

  await act(async () => {
    await wait(() =>
      expect(queryByTestId("test")).toHaveTextContent(isErrorMessage)
    );

    returnError = false;
    checkNowFunc();
    await wait(() =>
      expect(queryByTestId("test")).toHaveTextContent(isUpTodateMessage)
    );
  });
});

test("shows update required", async () => {
  const requiredMessage = "Update Required";
  const TestComponent = () => {
    const { updateState } = useUpdateChecker({
      getLatestAndRequiredVersions: getRemoteVersionTest(4, 3),
      getLocalVersion: getVersionMock(2),
      getUpdateStatus: compareVersionTest
    });

    if (updateState === "required") {
      return <Text testID="test">{requiredMessage}</Text>;
    }
    return null;
  };
  const { queryByTestId } = render(<TestComponent />);

  await act(async () => {
    await wait(() => queryByTestId("test"));
    expect(queryByTestId("test")).toHaveTextContent(requiredMessage);
  });
});

test("shows update available", async () => {
  const requiredMessage = "Update available";
  const TestComponent = () => {
    const { updateState } = useUpdateChecker({
      getLatestAndRequiredVersions: getRemoteVersionTest(4, 2),
      getLocalVersion: getVersionMock(2),
      getUpdateStatus: compareVersionTest
    });

    if (updateState === "latest") {
      return <Text testID="test">{requiredMessage}</Text>;
    }
    return null;
  };
  const { queryByTestId } = render(<TestComponent />);
  await act(async () => {
    await wait(() =>
      expect(queryByTestId("test")).toHaveTextContent(requiredMessage)
    );
  });
});

test("shows app is up to date", async () => {
  const requiredMessage = "App is up to date";
  const TestComponent = () => {
    const { updateState } = useUpdateChecker({
      getLatestAndRequiredVersions: getRemoteVersionTest(4, 2),
      getLocalVersion: getVersionMock(4),
      getUpdateStatus: compareVersionTest
    });

    if (updateState === "none") {
      return <Text testID="test">{requiredMessage}</Text>;
    }
    return null;
  };
  const { queryByTestId } = render(<TestComponent />);
  await act(async () => {
    await wait(() =>
      expect(queryByTestId("test")).toHaveTextContent(requiredMessage)
    );
  });
});
