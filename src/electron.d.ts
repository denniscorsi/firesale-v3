/// <reference types="vite/client" />
/// <reference types="electron" />

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

declare interface Window {
  api: {
    showOpenDialog: () => void;
    showExportDialog: (html: string) => void;
    saveFile: (content: string) => void;
    newFile: () => void;
    checkForUnsavedChanges: (content: string) => Promise<boolean>;
    revert: () => Promise<string>;
    showInFolder: () => void;
    openInDefault: () => void;
  };
}
