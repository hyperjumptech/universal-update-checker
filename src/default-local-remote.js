import DeviceInfo from 'react-native-device-info';
import firebase from 'react-native-firebase';

/**
 * get the current version from the app's build number on android and the version string from iOS
 */
export const getLocalVersion = () => {
  if (DeviceInfo) {
    if (Platform.OS === 'ios') {
      const readableVersion = DeviceInfo.getVersion();
      return readableVersion;
    } else if (Platform.OS === 'android') {
      const readableVersion = DeviceInfo.getBuildNumber();
      return readableVersion;
    }
  }
  return null;
};


/**
 * get the latest and required version from firebase
 */
export const getVersionsFromFirebase = () => {
  return firebase
    .config()
    .fetch(60)
    .then(() => {
      return firebase.config().activateFetched();
    })
    .then((activated) => {
      return firebase.config().getValues([
        // these properties need to be added in firebase remote config console
        'required_version_ios',
        'latest_version_ios',
        'required_version_android',
        'latest_version_android',
      ]);
    })
    .then((objects) => {
      let data = {};
      Object.keys(objects).forEach((key) => {
        data[key] = objects[key].val();
      });

      var latest;
      var required;
      if (Platform.OS === 'ios') {
        latest = data.latest_version_ios;
        required = data.required_version_ios;
      } else if (Platform.OS === 'android') {
        latest = data.latest_version_android;
        required = data.required_version_android;
      }

      return {
        latest,
        required,
      };
    })
    .catch((error) => {
      return {
        latest: null,
        required: null,
      };
    });
};

/**
 *
 * @param {any} localVersion The current version of the app
 * @param {any} latestVersion The latest version available
 * @param {any} requiredVersion The minimum required version of the app
 *
 * This function compares the local version with the required and latest version.
 *
 * On iOS, it compares the version string (x.x.x) of the local and latest/recommended version string from firebase.
 * On Android, it compared the build number (xxxxx) of the local and latest/recommended version string from firebase.
 * Returns: "required" | "latest" | "none" string.
 */
export const getUpdateStatus = (
  currentVersion,
  latestVersion,
  requiredVersion,
) => {
  let digitAndDotsOnlyRegex = /^\d+(\.\d+)*$/;
  if (!digitAndDotsOnlyRegex.test(DeviceInfo.getVersion())) {
    // If the version has non-numerical and dot characters, return "none".
    // During development, the version could have alphabet characters, e.g., 6.3-dev.
    return 'none';
  }

  if (Platform.OS === 'ios') {
    // function to convert version string (x.x.x) to a number value.
    const versionToValue = (version) => {
      var parts = version.split('.').reverse();
      return parts.reduce(
        (prev, curr, index) => prev + Math.pow(10, index) * curr,
        0,
      );
    };
    if (!latestVersion || !requiredVersion) {
      return 'none';
    }
    const requiredVersionValue = versionToValue(requiredVersion);
    const latestVersionValue = versionToValue(latestVersion);
    const localVersionValue = versionToValue(currentVersion);
    if (localVersionValue < requiredVersionValue) {
      return 'required';
    } else if (
      localVersionValue >= requiredVersionValue &&
      localVersionValue < latestVersionValue
    ) {
      return 'latest';
    }
    return 'none';
  } else if (Platform.OS === 'android') {
    if (currentVersion < requiredVersion) {
      return 'required';
    } else if (
      currentVersion >= requiredVersion &&
      currentVersion < latestVersion
    ) {
      return 'latest';
    }
    return 'none';
  }
};