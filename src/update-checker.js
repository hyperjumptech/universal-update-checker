import { useReducer, useRef, useEffect } from "react";

/**
 * Custom hook to check if the current version of the app needs to be updated.
 *
 * Parameters
 * - getLocalVersion: Func. The function is to get the current version of the app. By default, it uses the build number returned by react-native-device-info.
 * - getLatestAndRequiredVersions: Func. This function is to get the latest and required version of the app. By default, it uses firebase remote-config.
 * - getUpdateStatus: Func. The function to compare the local version and the latest/required version. It returns either "required", "latest", or "none" string.
 * - interval: number. The number in miliseconds to perform the version check periodically. Default is 0 which means it is only executed once.
 * - version: any. The optional current local version of the app. If this is set, getLocalVersion func will not be used to determine the current version of the app.
 * - onUpdateStateResolved: Func. This function will be called when the updateState has been resolved. This will give a chance for component that uses this library to do something with the result of the update check, e.g., to save to storage.
 *
 * Returns
 * This hook returns an object with following properties:
 * 1. isChecking: boolean. if true, the hook is checking and comparing the version of the app.
 * 2. updateState: "required" | "latest" | "none" string.
 *      - "required" means the current version of the app is lower than the minimum required version.
 *      - "latest" means there is a new version of the app but not required to update.
 *      - "none" means there is no new version of the app, a.k.a, the current version is up to date.
 * 3. error: Error object. This property is set when error occurs.
 * 4. lastChecked: Date. The last time this hook checks and compare the versions.
 * 5. checkNow: Func. Component that uses this hook can call this function to initiate the version checking.
 * 6. versions: { latest: any, required: any }. This property contains the latest and required version.
 */
export const useUpdateChecker = ({
  getLocalVersion,
  getLatestAndRequiredVersions,
  getUpdateStatus,
  interval = 0,
  version = null,
  onUpdateStateResolved
}) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  // if version is not null, override the getLocalVersion with a simple function that returns the version
  if (version) {
    getLocalVersion = () => version;
  }

  function startChecking() {
    dispatch({ payload: { isChecking: true }, type: "SET_IS_CHECKING" });
    performCheck({
      getLatestAndRequiredVersions,
      getLocalVersion,
      getUpdateStatus,
      onUpdateStateResolved
    })
      .then(({ status, versions }) => {
        dispatch({
          payload: { versions, updateState: status },
          type: "SET_RESULT"
        });
      })
      .catch(error => {
        dispatch({ payload: { error }, type: "SET_ERROR" });
      });
  }

  function checkNow() {
    dispatch({ type: "RELOAD" });
  }

  useInterval(() => {
    dispatch({ type: "RELOAD" });
  }, interval);

  useEffect(() => {
    startChecking();
  }, [state.lastChecked]);

  return { ...state, checkNow };
};

const defaultState = {
  error: null,
  isChecking: true,
  lastChecked: Date.now(),
  updateState: null,
  versions: null
};
function reducer(state = defaultState, action) {
  switch (action.type) {
    case "SET_RESULT": {
      return {
        ...state,
        isChecking: false,
        updateState: action.payload.updateState,
        versions: action.payload.versions
      };
    }
    case "SET_IS_CHECKING": {
      return {
        ...state,
        isChecking: action.payload.isChecking
      };
    }
    case "SET_ERROR": {
      return {
        ...state,
        error: action.payload.error,
        isChecking: false
      };
    }
    case "RELOAD": {
      return {
        ...defaultState,
        lastChecked: Date.now()
      };
    }
  }
  return state;
}

/**
 * Custom hook to run the callback periodically
 * @param {*} callback The code to run
 * @param {*} interval The interval
 */
function useInterval(callback, interval) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (interval !== null) {
      if (interval > 0) {
        let id = setInterval(tick, interval);
        return () => clearInterval(id);
      }
    }
  }, [interval]);
}

/**
 * This function performs:
 * 1. get the local version of the app (current version)
 * 2. get the latest and required version (can be from firebase, etc)
 * 3. compare the local version and the latest/required version and return the status
 */
const performCheck = async ({
  getLocalVersion,
  getLatestAndRequiredVersions,
  getUpdateStatus,
  onUpdateStateResolved
}) => {
  const localVersion = await getLocalVersion();
  const { latest, required } = await getLatestAndRequiredVersions();
  const status = await getUpdateStatus(localVersion, latest, required);

  if (onUpdateStateResolved) {
    await onUpdateStateResolved({
      status,
      versions: {
        latest,
        local: localVersion,
        required
      }
    });
  }

  return {
    status,
    versions: {
      latest,
      local: localVersion,
      required
    }
  };
};
