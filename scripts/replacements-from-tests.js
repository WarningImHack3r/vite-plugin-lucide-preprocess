import { EOL } from "node:os";
import tests from "../out.json";

/**
 * Matches "AssertionError: expected 'thing-a' to equal 'thing-b'"
 */
const LABEL_REGEX = /'(\S+)'.*?'(\S+)'/;

const failingMap = tests.testResults
	.flatMap(({ assertionResults }) =>
		assertionResults
			.flatMap(({ status, title, failureMessages }) => {
				if (status === "passed" || !failureMessages.length || !title.startsWith("Alias imports:"))
					return;
				const assertionError = failureMessages[0]?.split(EOL)[0];
				if (!assertionError) return;
				const assert = LABEL_REGEX.exec(assertionError);
				if (!assert) return;
				const [_, wrongModule, correctModule] = assert;
				return { wrongModule, correctModule };
			})
			.filter(entry => entry !== undefined)
	)
	.toSorted((a, b) => a.wrongModule.localeCompare(b.wrongModule))
	.reduce((acc, { wrongModule, correctModule }) => {
		acc[wrongModule] = correctModule;
		return acc;
	}, /** @type {Record<string, string>} */ ({}));

if (!Object.keys(failingMap).length) {
	throw new Error("No failed tests found, likely a breaking change from Lucide?");
}

console.log(JSON.stringify(failingMap, null, 4));
