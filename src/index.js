import React from "react";
import { useUpdateChecker as _useUpdateChecker } from "./update-checker";
import PropTypes from "prop-types";

/**
 * This is a component with a render props. (https://reactjs.org/docs/render-props.html)
 *
 * @param {Function} children Function child component
 * @param {Function} getLocalVersion A function that returns the local version of the app
 * @param {Function} getLatestAndRequiredVersions A function that returns the latest and required versions of the app
 * @param {Function} getUpdateStatus A function that returns update status of the app
 * @param {number} interval The interval to check the update status. Default 0.
 * @param {string} version The local version of the app
 * @param {Function} onUpdateStateResolved This function will be called when the updateState has been resolved. This will give a chance for component that uses this library to do something with the result of the update check, e.g., to save to storage.
 */
const UpdateChecker = ({
  children,
  getLocalVersion,
  getLatestAndRequiredVersions,
  getUpdateStatus,
  interval,
  version,
  onUpdateStateResolved
}) => {
  const result = _useUpdateChecker({
    getLatestAndRequiredVersions,
    getLocalVersion,
    getUpdateStatus,
    interval,
    onUpdateStateResolved,
    version
  });
  return <>{children(result)}</>;
};

UpdateChecker.propTypes = {
  children: PropTypes.func,
  getLatestAndRequiredVersions: PropTypes.func,
  getLocalVersion: PropTypes.func,
  getUpdateStatus: PropTypes.func,
  interval: PropTypes.number,
  onUpdateStateResolved: PropTypes.func,
  version: PropTypes.any
};

export const useUpdateChecker = _useUpdateChecker;
export default UpdateChecker;
