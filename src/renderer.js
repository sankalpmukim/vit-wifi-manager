const updateOnlineStatus = () => {
  document.getElementById("status-value").innerHTML = navigator.onLine
    ? "connected to wifi"
    : "not connected to wifi";
};

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

updateOnlineStatus();
