function logout() {
  fetch("/logout", {
    method: "POST",
    credentials: "same-origin",
  })
    .then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    })
    .catch((error) => {
      console.error("Error logging out:", error);
    });
}
