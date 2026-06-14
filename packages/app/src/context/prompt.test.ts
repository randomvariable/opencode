import { beforeAll, describe, expect, mock, test } from "bun:test"
import { ServerScope } from "@/utils/server-scope"

let getPromptSessionCacheKey: typeof import("./prompt").getPromptSessionCacheKey
let isPromptSessionReady: typeof import("./prompt").isPromptSessionReady

beforeAll(async () => {
  mock.module("@solidjs/router", () => ({
    useParams: () => ({}),
    useSearchParams: () => [{}],
  }))
  mock.module("@opencode-ai/ui/context", () => ({
    createSimpleContext: () => ({
      use: () => undefined,
      provider: () => undefined,
    }),
  }))
  const mod = await import("./prompt")
  getPromptSessionCacheKey = mod.getPromptSessionCacheKey
  isPromptSessionReady = mod.isPromptSessionReady
})

describe("getPromptSessionCacheKey", () => {
  test("separates prompt sessions by server scope", () => {
    const local = getPromptSessionCacheKey(ServerScope.local, { dir: "/repo", id: "ses_123" })
    const remote = getPromptSessionCacheKey("ssh:debian" as ServerScope, { dir: "/repo", id: "ses_123" })

    expect(String(local)).toBe("local\u0000/repo\u0000ses_123")
    expect(String(remote)).toBe("ssh:debian\u0000/repo\u0000ses_123")
    expect(remote).not.toBe(local)
  })

  test("separates workspace prompt sessions by server scope", () => {
    expect(String(getPromptSessionCacheKey(ServerScope.local, { dir: "/repo", id: undefined }))).toBe(
      "local\u0000/repo\u0000__workspace__",
    )
  })

  test("keeps explicit draft sessions keyed by draft id", () => {
    expect(getPromptSessionCacheKey(ServerScope.local, { draftID: "draft_123" })).toBe("draft:draft_123")
  })
})

describe("isPromptSessionReady", () => {
  test("returns the readiness accessor value instead of the accessor function", () => {
    expect(isPromptSessionReady({ ready: () => false })).toBe(false)
    expect(isPromptSessionReady({ ready: () => true })).toBe(true)
  })
})
