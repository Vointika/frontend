const HTTP_START = /^https?:\/\/[^/?#\\]/i;

// Java's \p{Cntrl}: U+0000–U+001F and U+007F.
const hasControlCharacter = (value: string): boolean =>
	[...value].some((char) => {
		const code = char.codePointAt(0) ?? 0;
		return code < 0x20 || code === 0x7f;
	});

// The backend's WebUrl rule, which follows the browser's URL parsing: no
// control characters, exactly `http://` or `https://` followed by the start
// of a host, and an address the browser can parse (it checks the domain,
// IPv4 and IPv6 forms and the port up to 65535 the way the backend does).
export const isWebUrl = (raw: string): boolean => {
	const value = raw.trim();
	if (hasControlCharacter(value) || !HTTP_START.test(value)) return false;
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
};
