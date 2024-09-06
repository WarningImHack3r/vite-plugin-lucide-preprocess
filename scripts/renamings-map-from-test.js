import tests from "../out.json";

const failingMap = tests.testResults
	.map(testResult =>
		testResult.assertionResults
			.map(({ status, title, failureMessages }) => {
				if (status === "passed" || !title.startsWith("Alias imports:") || !failureMessages.length)
					return;
				const assertionError = failureMessages[0]?.split("\n")[0];
				if (!assertionError) return;
				const assert = /'(\S+)'.*?'(\S+)'/.exec(assertionError);
				if (!assert) return;
				const [_, wrongModule, correctModule] = assert;
				return { wrongModule, correctModule };
			})
			.filter(Boolean)
			.flat()
	)
	.flat();

console.log(
	"{\n" +
		failingMap
			.map(({ wrongModule, correctModule }) => `\t"${wrongModule}": "${correctModule}"`)
			.join(",\n") +
		"\n}"
);
