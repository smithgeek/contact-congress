// interface FormData {
// 	user: {
// 		name: {
// 			full: string;
// 			first: string;
// 			last: string;
// 		};
// 		address: {
// 			street: string;
// 			city: string;
// 			stateAbbreviation: string;
// 			state: string;
// 			zip: string;
// 		};
// 		phone: string;
// 		email: string;
// 	};
// 	template: {
// 		subject: string;
// 		message: string;
// 		title: string;
// 		validOrigin: string;
// 	};
// }
function fillForm() {
	chrome.storage.local.get(["formData"], data => {
		const formData = data.formData;
		if (formData) {
			const correctSite =
				location.origin === formData.template.validOrigin;
			const inputs = document.querySelectorAll(
				"form input, form textarea, form select"
			);
			inputs.forEach(input => {
				const label = document.querySelector(
					`label[for="${input.id}"]`
				);
				if (label) {
					const text = label.innerText.toLowerCase();
					if (text.includes("name")) {
						if (text.includes("first")) {
							input.value = formData.user.name.first;
						} else if (text.includes("last")) {
							input.value = formData.user.name.last;
						} else {
							input.value = formData.user.name.full;
						}
					} else if (
						text.includes("address") &&
						!text.includes("2")
					) {
						input.value = formData.user.address.street;
					} else if (text.includes("city")) {
						input.value = formData.user.address.city;
					} else if (text.includes("state")) {
						input.value = formData.user.address.state;
						if (input.value === "") {
							input.value =
								formData.user.address.stateAbbreviation;
						}
					} else if (text.includes("zip")) {
						input.value = formData.user.address.zip;
					} else if (text.includes("phone")) {
						input.value = formData.user.phone;
					} else if (text.includes("email")) {
						input.value = formData.user.email;
					} else if (text.includes("subject") && correctSite) {
						input.value = formData.template.subject;
					} else if (
						(text.includes("message") ||
							text.includes("comment")) &&
						correctSite
					) {
						input.value = formData.template.message;
					}
				}
			});
		}
	});
}

fillForm();
