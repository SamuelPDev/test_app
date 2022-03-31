self.addEventListener("install", () => {
  console.log("install....");
});

self.addEventListener("activate", () => {
  console.log("activate....");
});

self.addEventListener("fetch", () => {
  console.log("fetch....");
});
