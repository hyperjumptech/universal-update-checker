import * as React from "react";

declare function UpdateChecker(props: {
  children: (args: {
    isChecking: boolean;
    updateState: "required" | "latest" | "none";
    error: any;
    lastChecked: Date;
    checkNow: () => void;
    versions: {
      local: string | number;
      latest: string | number;
      required: string | number;
    };
  }) => React.ReactElement;
  getLocalVersion: () => Promise<string | number>;
  getLatestAndRequiredVersions: () => Promise<{
    latest: string | number;
    required: string | number;
  }>;
  getUpdateStatus: (
    localVersion: string | number,
    latest: string | number,
    required: string | number
  ) => Promise<{
    status: "required" | "latest" | "none";
    versions: {
      local: string | number;
      latest: string | number;
      required: string | number;
    };
  }>;
  interval?: number;
  version?: string | number;
  onUpdateStateResolved: (args: {
    status: "required" | "latest" | "none";
    versions: {
      latest: string | number;
      required: string | number;
    };
  }) => Promise<any>;
}): React.ReactElement;

declare namespace UpdateChecker {
  function useUpdateChecker(args: {
    getLocalVersion: () => Promise<string | number>;
    getLatestAndRequiredVersions: () => Promise<{
      latest: string | number;
      required: string | number;
    }>;
    getUpdateStatus: (
      localVersion: string | number,
      latest: string | number,
      required: string | number
    ) => Promise<{
      status: "required" | "latest" | "none";
      versions: {
        local: string | number;
        latest: string | number;
        required: string | number;
      };
    }>;
    interval?: number;
    version?: string | number;
    onUpdateStateResolved: (args: {
      status: "required" | "latest" | "none";
      versions: {
        latest: string | number;
        required: string | number;
      };
    }) => Promise<any>;
  }): {
    isChecking: boolean;
    updateState: "required" | "latest" | "none";
    error: any;
    lastChecked: Date;
    checkNow: () => void;
    versions: {
      latest: string | number;
      required: string | number;
    };
  };
}

export = UpdateChecker;
