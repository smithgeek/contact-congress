var btn = document.getElementById("clearButton");

function createTable(cells) {
	const table = document.getElementById("table");
	table.innerHTML = "";
	for (const cell of cells) {
		const label = document.createElement("label");
		label.textContent = cell;
		table.appendChild(label);
	}
}

chrome.storage.local.get(["formData"], msg => {
	if (msg.formData) {
		createTable([
			"Message",
			msg.formData.template.title,
			"For Site",
			msg.formData.template.validOrigin,
		]);
		btn.style.display = "block";
	} else {
		createTable(["Message", "None"]);
	}
});

btn.addEventListener("click", () => {
	chrome.storage.local.remove(["formData"]);
	createTable(["Message", "None"]);
	btn.style.display = "none";
});
