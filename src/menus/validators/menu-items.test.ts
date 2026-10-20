import { describe, expect, it } from "vitest";
import { type MenuItemFormNode, menuItemsSchema } from "./menu-items";

const node = (over: Partial<MenuItemFormNode> = {}): MenuItemFormNode => ({
	title: "Home",
	linkType: "HOME",
	resourceId: "",
	url: "",
	translations: {},
	children: [],
	...over,
});

const paths = (value: { items: MenuItemFormNode[] }) =>
	menuItemsSchema.safeParse(value).error?.issues.map((i) => i.path.join("."));

describe("menuItemsSchema", () => {
	it("reports a missing URL on the nested item that lacks it", () => {
		const result = paths({
			items: [
				node(),
				node({
					title: "Guides",
					children: [node({ title: "Blog", linkType: "EXTERNAL_URL" })],
				}),
			],
		});

		expect(result).toContain("items.1.children.0.url");
		expect(result).not.toContain("items.0.url");
	});

	it("requires a target on a resource link", () => {
		expect(paths({ items: [node({ linkType: "PAGE" })] })).toContain(
			"items.0.resourceId",
		);
	});

	it("requires a target on a category link too", () => {
		expect(paths({ items: [node({ linkType: "CATEGORY" })] })).toContain(
			"items.0.resourceId",
		);
	});

	it("requires a title at any depth", () => {
		expect(
			paths({ items: [node({ children: [node({ title: "  " })] })] }),
		).toContain("items.0.children.0.title");
	});

	it("accepts a link kind that needs neither target nor URL", () => {
		expect(menuItemsSchema.safeParse({ items: [node()] }).success).toBe(true);
	});

	it("accepts a filled external link and a filled resource link", () => {
		expect(
			menuItemsSchema.safeParse({
				items: [
					node({ linkType: "EXTERNAL_URL", url: "https://example.com" }),
					node({ linkType: "PAGE", resourceId: "page-1" }),
				],
			}).success,
		).toBe(true);
	});

	const urlIssue = (url: string) =>
		menuItemsSchema
			.safeParse({ items: [node({ linkType: "EXTERNAL_URL", url })] })
			.error?.issues.find((i) => i.path.join(".") === "items.0.url")?.message;

	it.each([
		"https://www.instagram.com/scapepark",
		"http://localhost:8080/policies/cancellation",
		"  https://example.com  ",
	])("accepts the web address %j", (url) => {
		expect(urlIssue(url)).toBeUndefined();
	});

	it.each([
		"not a url",
		"www.instagram.com/scapepark",
		"ftp://example.com/file",
		"mailto:hello@example.com",
		"https://",
		"https://exa mple.com",
		"https://example.com/a b",
		"http:///path",
		"https:/example.com",
		"http://:80",
	])("refuses %j on the item's own URL field, before the backend does", (url) => {
		expect(urlIssue(url)).toBe(
			"Enter a full web address, like https://example.com.",
		);
	});

	it("names a malformed URL on the nested item that has it", () => {
		expect(
			paths({
				items: [
					node({
						title: "Social",
						children: [
							node({
								title: "Instagram",
								linkType: "EXTERNAL_URL",
								url: "instagram",
							}),
						],
					}),
				],
			}),
		).toEqual(["items.0.children.0.url"]);
	});
});
