/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { start } from "$fresh/server.ts";
import { setup } from "@twind";
import * as colors from "twind/colors";
import { virtualSheet } from "twind/sheets";

import routes from "./fresh.gen.ts";

const sheet = virtualSheet();
sheet.reset();
setup({ sheet, theme: { colors } });

await start(routes, {
  render(ctx, render) {
    const snapshot = ctx.state.get("twindSnapshot") as unknown[] | null;
    sheet.reset(snapshot || undefined);
    render();
    ctx.styles.splice(0, ctx.styles.length, ...sheet.target);
    const newSnapshot = sheet.reset();
    ctx.state.set("twindSnapshot", newSnapshot);
  },
});
