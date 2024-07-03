document.addEventListener("DOMContentLoaded", () => {
	const inputElements = document.getElementsByTagName("input");

	for (const inputElement of inputElements) {
		if (inputElement.type === "password") {
			console.log(inputElement);
		}
	}
});
