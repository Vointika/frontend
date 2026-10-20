import { z } from "zod";
import * as m from "#/paraglide/messages";
import { MENU_LINK_TYPES } from "../format";

export interface MenuItemFormNode {
	title: string;
	linkType: (typeof MENU_LINK_TYPES)[number];
	resourceId: string;
	url: string;
	translations: Record<string, string>;
	children: MenuItemFormNode[];
}

// The backend's rule (WebUrl): a URI with an http or https scheme and a host.
// The browser's URL repairs what Java's URI refuses (`http:///x` and
// `https:/x` gain a host, a space is encoded), so the shape is checked as
// written: the scheme, `//`, then a host character, and no whitespace.
const WEB_URL = /^https?:\/\/[^/?#\s]/i;

const isWebUrl = (raw: string): boolean => {
	const value = raw.trim();
	if (!WEB_URL.test(value) || /\s/.test(value)) return false;
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
};

const menuItemNodeSchema: z.ZodType<MenuItemFormNode, MenuItemFormNode> =
	z.lazy(() =>
		z
			.object({
				title: z.string().trim().min(1, m.menu_items_title_required()),
				linkType: z.enum(MENU_LINK_TYPES as [string, ...string[]]),
				resourceId: z.string(),
				url: z.string().trim(),
				translations: z.record(z.string(), z.string()),
				children: z.array(menuItemNodeSchema),
			})
			.superRefine((node, ctx) => {
				if (
					(node.linkType === "EXPERIENCE" ||
						node.linkType === "PAGE" ||
						node.linkType === "CATEGORY") &&
					!node.resourceId
				) {
					ctx.addIssue({
						code: "custom",
						path: ["resourceId"],
						message: m.menu_items_target_required(),
					});
				}
				if (node.linkType === "EXTERNAL_URL") {
					if (!node.url.trim()) {
						ctx.addIssue({
							code: "custom",
							path: ["url"],
							message: m.menu_items_url_required(),
						});
					} else if (!isWebUrl(node.url)) {
						ctx.addIssue({
							code: "custom",
							path: ["url"],
							message: m.menu_items_url_invalid(),
						});
					}
				}
			}),
	) as z.ZodType<MenuItemFormNode, MenuItemFormNode>;

interface MenuItemsFormData {
	items: MenuItemFormNode[];
}

export const menuItemsSchema: z.ZodType<MenuItemsFormData, MenuItemsFormData> =
	z.object({
		items: z.array(menuItemNodeSchema),
	});
