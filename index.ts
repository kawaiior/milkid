import { XXH64 } from "xxh3-ts";
const ENCODING =
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const ENCODING_FIRST_CHAR =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

let lastTime = 0;
let lastDecimal = 0n;

export type IdGeneratorOptions = {
	length?: number;
	timestamp: boolean;
	fingerprint?: boolean;
	hyphen?: boolean;
	sequential?: boolean;
	magicNumber?: number;
};

export function defineIdGenerator(options: IdGeneratorOptions) {
	const textEncoder = new TextEncoder();
	const randLength =
		(options.length ?? 24) +
		1 -
		(options.timestamp ? 7 : 0) -
		(options.fingerprint ? 5 : 0);
	let maxRandCharacter = "";
	for (let i = 0; i < randLength; i++) maxRandCharacter += "z";
	const maxRandDecimal = characterToDecimal(maxRandCharacter);

	return {
		createId(fingerprint?: string | Buffer) {
			if (options.fingerprint && !fingerprint)
				throw new Error("fingerprint is required");

			const now = Date.now();

			let id = "";
			if (options.timestamp) {
				id += decimalToCharacter(
					BigInt(now - (options.magicNumber ?? 733882188971)),
				);
				if (id.length > 7) id = id.slice(-7);
			}
			if (options.fingerprint) {
				if (options.hyphen) id += "-";
				if (Buffer.isBuffer(fingerprint)) {
					id += decimalToCharacter(
						BigInt(XXH64(fingerprint).toString(10)),
					).slice(2, 7);
				} else if (typeof fingerprint === "string") {
					id += decimalToCharacter(
						BigInt(
							XXH64(Buffer.from(textEncoder.encode(fingerprint))).toString(10),
						),
					).slice(2, 7);
				}
			}
			if (randLength > 1) {
				if (options.hyphen) id += "-";
				let decimal: bigint;
				if (options.sequential !== false) {
					if (lastTime !== now) {
						lastTime = now;
						decimal = random(maxRandDecimal);
						lastDecimal = decimal;
					} else {
						lastDecimal = lastDecimal + 1n;
						decimal = lastDecimal;
					}
					console.log(lastTime !== now, decimal);
				} else {
					decimal = random(maxRandDecimal);
				}
				id += decimalToCharacter(decimal)
					.padStart(randLength, "0")
					.slice(1, randLength + 1);
			}

			return id;
		},
	};
}

function decimalToCharacter(decimal: bigint): string {
	let result = "";
	while (decimal > 0) {
		if (decimal <= 62n) {
			result = ENCODING_FIRST_CHAR[Number(decimal % 52n)] + result;
			decimal = decimal / 52n;
		} else {
			result = ENCODING[Number(decimal % 62n)] + result;
			decimal = decimal / 62n;
		}
	}
	return result || "0";
}

function characterToDecimal(character: string): bigint {
	let decimal = 0n;
	const base = BigInt(ENCODING.length);
	for (let i = 0; i < character.length; i++) {
		const charIndex = ENCODING.indexOf(character[i]);
		decimal = decimal * base + BigInt(charIndex);
	}
	return decimal;
}

function random(limit: bigint) {
	if (limit <= 0n) throw new Error("Limit must be larger than 0");

	let width = 0n;
	for (let n = limit; n > 0n; width++) {
		n >>= 64n;
	}

	const max = 1n << (width * 64n);
	const buf = new BigUint64Array(Number(width));
	const min = max - (max % limit);

	let sample = 0n;
	do {
		const arrayBuffer = crypto.getRandomValues(new Uint8Array(buf.length * 8));
		const view = new DataView(arrayBuffer.buffer);
		sample = 0n;
		for (let i = 0; i < buf.length; i++) {
			sample = (sample << 64n) | BigInt(view.getBigUint64(i * 8));
		}
	} while (sample >= min);

	return sample % limit;
}
