window.addEventListener("message", function (event) {
	// We only accept messages from ourselves
	if (event.source != window) return;

	if (event.data.type && event.data.type == "congress-form-data") {
		console.log(event);
		chrome.storage.local.set({ formData: event.data.formData });
	}
});
