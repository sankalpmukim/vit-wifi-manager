const wifi = require("node-wifi");

window.addEventListener("DOMContentLoaded", () => {
  const Store = require("electron-store");
  console.log("Hello World");
  const store = new Store();
  wifi.init({
    iface: null, // network interface, choose a random wifi interface if set to null
  });

  const updateDisplay = () => {
    const regno = store.get("regno");
    const regnoP = document.getElementById("regno-display");
    regnoP.innerText = regno;

    const password = store.get("password");
    const passwordP = document.getElementById("password-display");
    passwordP.innerText = password;
  };
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
  updateDisplay();
  const form = document.getElementById("regform");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const regno = document.getElementById("regno").value;
    const password = document.getElementById("password").value;
    // clear the input fields
    document.getElementById("regno").value = "";
    document.getElementById("password").value = "";
    store.set("regno", regno);
    store.set("password", password);
    updateDisplay();
    console.log("regno is", store.get("regno"));
    console.log("password is", store.get("password"));
  });
  const loginToWifiBtn = document.getElementById("login-to-wifi");
  loginToWifiBtn.addEventListener("click", loginToWifi);
  const logoutFromWifiBtn = document.getElementById("logout-wifi");
  logoutFromWifiBtn.addEventListener("click", logoutFromWifi);
  const connectTo24GWifiBtn = document.getElementById("connect-to-24g-wifi");
  connectTo24GWifiBtn.addEventListener("click", connectTo24GWifi);
  const connectTo5GWifiBtn = document.getElementById("connect-to-5g-wifi");
  connectTo5GWifiBtn.addEventListener("click", connectTo5GWifi);
  const disconnectFromWifiBtn = document.getElementById("disconnect-from-wifi");
  disconnectFromWifiBtn.addEventListener("click", disconnectFromWifi);
});
