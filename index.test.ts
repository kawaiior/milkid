import { expect, test } from "vitest";
import { defineIdGenerator } from "./index.ts";

test("basic", () => {
	const idGenerator = defineIdGenerator({
		length: 24,
		hyphen: false,
		fingerprint: false,
		timestamp: true,
		sequential: true,
		magicNumber: 12345678,
	});

	const data = new Set();
	for (let index = 0; index < 16; index++) {
		const id = idGenerator.createId();
		data.add(id);
	}

	console.log(data);
	expect(data.size === 16).toBe(true);
});

test("one million", { skip: true, timeout: 100000 }, () => {
	const idGenerator = defineIdGenerator({
		length: 16,
		timestamp: false,
	});

	console.time();
	const count = 1000000;
	const data = new Set();
	for (let i = 0; i < count; i++) {
		const id = idGenerator.createId();
		data.add(id);
	}
	console.timeEnd();

	expect(data.size === count).toBe(true);
});
