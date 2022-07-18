const { app, BrowserWindow, Menu, Tray } = require("electron");
const Store = require("electron-store");
const path = require("path");
const wifi = require("node-wifi");
const fetch = require("node-fetch");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const loginToWifi = async () => {
  const regno = store.get("regno");
  const password = store.get("password");
  console.log("Login attempt");
  try {
    await fetch(
      "http://phc.prontonetworks.com/cgi-bin/authlogin?URI=http://www.msftconnecttest.com/redirect",
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "max-age=0",
          "content-type": "application/x-www-form-urlencoded",
          "sec-gpc": "1",
          "upgrade-insecure-requests": "1",
        },
        referrer:
          "http://phc.prontonetworks.com/cgi-bin/authlogin?URI=http://www.msftconnecttest.com/redirect",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `userId=${regno}&password=${password}&serviceName=ProntoAuthentication&Submit22=Login`,
        method: "POST",
        mode: "cors",
        credentials: "omit",
      }
    );
  } catch (error) {
    console.log(error);
    alert("Login failed");
  }
};
const logoutFromWifi = async () => {
  console.log("Logout attempt");
  try {
    await fetch("http://phc.prontonetworks.com/cgi-bin/authlogout?blank=");
  } catch (error) {
    console.log(error);
    alert("Logout failed");
  }
};
const disconnectFromWifi = async () => {
  await wifi.disconnect();
};
const connectTo24GWifi = async () => {
  // if connected to wifi that is not 2.4G wifi, disconnect
  if ((await wifi.getCurrentConnectedSSID()) !== "VIT24G") {
    await disconnectFromWifi();
    await wifi.connect({ ssid: "VIT2.4G" });
  }
};
const connectTo5GWifi = async () => {
  // if connected to wifi that is not 5G wifi, disconnect
  if ((await wifi.getCurrentConnectedSSID()) !== "VIT5G") {
    await disconnectFromWifi();
    await wifi.connect({ ssid: "VIT5G" });
  }
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  const AutoLaunch = require("auto-launch");
  const autoLauncher = new AutoLaunch({
    name: "MyApp",
  });
  // Checking if autoLaunch is enabled, if not then enabling it.
  autoLauncher
    .isEnabled()
    .then(function (isEnabled) {
      if (isEnabled) return;
      autoLauncher.enable();
    })
    .catch(function (err) {
      throw err;
    });

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  try {
    app?.dock.hide();
    console.log(`App dock undefined: ${app.dock === undefined}`);
  } catch (error) {}
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

let appIcon = null;
app.whenReady().then(() => {
  appIcon = new Tray(path.join(__dirname, "icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Window",
      click: () => {
        createWindow();
      },
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
    {
      label: "Connect to 24G",
      click: () => {
        connectTo24GWifi();
      },
    },
    {
      label: "Connect to 5G",
      click: () => {
        connectTo5GWifi();
      },
    },
  ]);

  // Make a change to the context menu
  contextMenu.items[1].checked = false;

  // Call this again for Linux because we modified the context menu
  appIcon.setContextMenu(contextMenu);
  appIcon.on("click", async () => {
    console.log("clicked");
    await connectTo24GWifi();
    await loginToWifi();
  });
  appIcon.on("double-click", async () => {
    console.log("double clicked");
    await logoutFromWifi();
    await disconnectFromWifi();
  });
});

// initializing the store
const store = new Store();
wifi.init({
  iface: null, // network interface, choose a random wifi interface if set to null
});

// initializing regno
if (store.get("regno") === undefined) {
  console.log("No regno in store");
  store.set("regno", "");
} else {
  console.log("regno is", store.get("regno"));
}

// initializing password
if (store.get("password") === undefined) {
  console.log("No password in store");
  store.set("password", "");
} else {
  console.log("password is", store.get("password"));
}
