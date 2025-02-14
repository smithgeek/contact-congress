var btn = document.getElementById("clearButton");

chrome.storage.local.get(["formData"], msg => {
	if (msg.formData && msg.formData.template.validOrigin === location.origin) {
		document.getElementById("msg").innerText = msg.formData.template.title;
		btn.style.display = "block";
	} else {
		document.getElementById("msg").innerText = "None";
	}
});

btn.addEventListener("click", () => {
	chrome.storage.local.remove(["formData"]);
	document.getElementById("msg").innerText = "None";
	btn.style.display = "none";
});
