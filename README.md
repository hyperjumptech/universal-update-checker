[![Build Status](https://travis-ci.org/hyperjumptech/universal-update-checker.svg?branch=master)](https://travis-ci.org/hyperjumptech/universal-update-checker)
[![Build Status](https://dev.azure.com/hyperjumptech/universal-update-checker/_apis/build/status/hyperjumptech.universal-update-checker?branchName=master)](https://dev.azure.com/hyperjumptech/universal-update-checker/_build/latest?definitionId=1&branchName=master)

# Universal Update Checker

## About

This library provides react native app ability to perform certain actions when the current version of the app is out of date. With this library you can define `latest` version and `required` version of the app, then force the user to update the app if the current version of the app is lower than `required` version. If the app is higher than the required version but lower than the latest version, you can recommend the user to update the app.

This library is flexible on:

- how to get the current version of the app. You can simply tell the library what version to use, or you can provide it with your own function that returns the current version.
- how to get the latest and required version of the app.
- how to compare the current version and the latest and/or required version. You can write a function that returns one of three strings: `none`, `required`, or `latest`: `none` string if the app is up to date, `required` string if the current version of the app is less than the required version, and `latest` string if the there is a new version of the app.

You can use the functions defined in `universal-update-checker/default-local-remote` to get the local version and remove versions:

- `getLocalVersion`: this function returns the app version on iOS (e.g., `1.0.0`) and the `versionCode` on Android.
- `getVersionsFromFirebase`: this function fetches the required and latest versions from Firebase Remote Config.
- `getUpdateStatus`: this function compares the local version and the remote versions. This function will simply compare the versions with `<` and `>` operators. 

## Requirements

If you don't provide your own functions to get the current version of the app and to compare the versions, your react native app must

1. install the following dependencies:

   - [react-native-device-info](https://github.com/react-native-community/react-native-device-info)
   - [react-native-firebase](https://rnfirebase.io/)

2. Set up your app to use Firebase.
3. Create 4 parameters in your [project's remote config](https://console.firebase.google.com/):

   - `latest_version_ios`
   - `required_version_ios`
   - `latest_version_android`
   - `required_version_android`

## Installation

Using npm:

```
npm i @hyperjumptech/universal-update-checker
```

or using yarn:

```
yarn add @hyperjumptech/universal-update-checker
```

## Usage

Using render props:

```javascript
import UpdateChecker from "@hyperjumptech/universal-update-checker";
import {
  getUpdateStatus,
  getVersionsFromFirebase,
  getLocalVersion
} from "@hyperjumptech/universal-update-checker/default-local-remote";

const Root = () => {
  return (
    <UpdateChecker
      getLocalVersion={getLocalVersion}
      getLatestAndRequiredVersions={getVersionsFromFirebase}
      getUpdateStatus={getUpdateStatus}
    >
      {({ isChecking, updateState, versions, checkNow }) => {
        if (isChecking) {
          return <ActivityIndicator size="large" color="#0000ff" />;
        } else {
          if (updateState === "required") {
            // show modal screen
            return (
              <View style={styles.updateRequired}>
                <Text style={styles.centerText}>
                  You have to update the app from the App Store or Play Store.
                  Current vesion: {versions.local}. Required version:{" "}
                  {versions.required}
                </Text>
              </View>
            );
          } else if (updateState === "latest") {
            // show alert
            Alert.alert(
              "New Update",
              "There is a new update in the App Store or Play Store"
            );
            return null;
          } else if (updateState === "none") {
            // continue with your App
            return <App />;
          }
        }
      }}
    </UpdateChecker>
  );
};
```

Using react hook:

```javascript
import { useUpdateChecker } from "@hyperjumptech/universal-update-checker";
import {
  getUpdateStatus,
  getVersionsFromFirebase,
  getLocalVersion
} from "@hyperjumptech/universal-update-checker/default-local-remote";

const Root = () => {
  const { isChecking, updateState } = useUpdateChecker({
    getLocalVersion,
    getLatestAndRequiredVersions: getVersionsFromFirebase,
    getUpdateStatus
  });

  if (isChecking) {
    return <ActivityIndicator />;
  }

  if (updateState === "required") {
    // show modal screen
    return (
      <View style={styles.updateRequired}>
        <Text style={styles.centerText}>
          You have to update the app from the App Store or Play Store. Current
          vesion: {versions.local}. Required version: {versions.required}
        </Text>
      </View>
    );
  } else if (updateState === "latest") {
    // show alert
    Alert.alert(
      "New Update",
      "There is a new update in the App Store or Play Store"
    );
    return null;
  }

  // continue with your App
  return <App />;
};
```

## API

`UpdateChecker` component and `useUpdateChecker` hook receives the same props/arguments and returns the same object.

Props/arguments:

- `getLocalVersion`: Func. The function is to get the current version of the app. By default, it uses the build number returned by react-native-device-info.
- `getLatestAndRequiredVersions`: Func. This function is to get the latest and required version of the app. By default, it uses firebase remote-config.
- `getUpdateStatus`: Func. The function to compare the local version and the latest/required version. It returns either "`required`", "`latest`", or "`none`" string.
- `interval`: number. The number in miliseconds to perform the version check periodically. Default is `0` which means it is only executed once.
- `version`: any. The optional current local version of the app. If this is set, getLocalVersion func will not be used to determine the current version of the app.
- `onUpdateStateResolved`: Func. This function will be called when the updateState has been resolved. This will give a chance for component that uses this library to do non-declarative work with the result of the update check, e.g., to save to storage. The function will receive an object as argument:

```
{
  status: "required" | "latest" | "none";
  versions: {
    latest: string | number;
    required: string | number;
  };
}
```

Returns:

1.  `isChecking`: boolean. if true, the hook is checking and comparing the version of the app.
2.  `updateState`: "`required`" | "`latest`" | "`none`" string.

    - "required" means the current version of the app is lower than the minimum required version.
    - "latest" means there is a new version of the app but not required to update.
    - "none" means there is no new version of the app, a.k.a, the current version is up to date.

3.  `error`: Error object. This property is set when error occurs. Default `null`.
4.  `lastChecked`: Date. The last time this hook checks and compare the versions.
5.  `checkNow`: Func. You can call this function to initiate the version checking.
6.  `versions`: `{ latest: any, required: any }`. This property contains the latest and required version.

## TODO

- Example app
