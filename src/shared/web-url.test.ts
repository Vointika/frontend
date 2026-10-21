import { describe, expect, it } from "vitest";
import { isWebUrl } from "./web-url";

// Each address's verdict is the backend's: these lists were produced by
// running WebUrl.requireHttpOrHttps (backend 722dbe93) on every address.
const ACCEPTED_BY_THE_BACKEND = [
	"https://example.com",
	"http://localhost:8080/policies/cancellation",
	"https://www.instagram.com/scapepark",
	"HTTPS://EXAMPLE.COM/A",
	"https://café.com",
	"https://xn--caf-dma.com",
	"https://my_site.example.com",
	"https://-example.com",
	"https://example.com/a|b",
	"https://example.com/{x}",
	'https://example.com/"q"',
	"https://example.com/a\\b",
	"https://example.com/%zz",
	"https://example.com/a b",
	"https://example.com:65535",
	"https://example.com:",
	"https://user:pw@example.com/x",
	"https://[::1]:8080/x",
	"https://192.168.0.1",
	"https://0x7f.1",
	"https://example.com.",
	"https://ex%61mple.com",
	"https://example.com/a?b#c",
	"https://@example.com",
	"https://例え.テスト",
	"https://example。com",
	"https://wa.me/18095551234",
];

const REFUSED_BY_THE_BACKEND = [
	"https://exa mple.com",
	"https://example.com:65536",
	"https://example.com:99999",
	"https://example.com:8a",
	"https://[::1",
	"https://999.1.1.1",
	"https://1.2.3.4.5",
	"https://example.123",
	"https://ex%zzmple.com",
	"https://xn--a.com",
	"https://exa<mple.com",
	"https://exa^mple.com",
	"https:x",
	"https:/example.com",
	"http:///path",
	"http:\\\\example.com",
	"https://\\example.com",
	"https://",
	"https://:80",
	"https://user@",
	"https://?q",
	"https://#f",
	"ftp://example.com/file",
	"mailto:hello@example.com",
	"www.instagram.com/scapepark",
	"not a url",
	"https://example.com/a\tb",
	"https://exa\nmple.com",
];

describe("isWebUrl", () => {
	it.each(ACCEPTED_BY_THE_BACKEND)("accepts %j, as the backend does", (url) => {
		expect(isWebUrl(url)).toBe(true);
	});

	it.each(REFUSED_BY_THE_BACKEND)("refuses %j, as the backend does", (url) => {
		expect(isWebUrl(url)).toBe(false);
	});

	it("reads the address as the form sends it, trimmed", () => {
		expect(isWebUrl("  https://example.com  ")).toBe(true);
	});
});
