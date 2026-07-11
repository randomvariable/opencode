import { Context, Effect, Layer, LayerMap } from "effect"
import { LayerNode } from "./effect/layer-node"
import { Node } from "./effect/app-node"
import { Location } from "./location"
import type { BrowseError, BrowseServices } from "./location-services"

// A LayerMap keyed by Location.Ref that provides ONLY the filesystem services
// needed to browse a directory (list/find/read). It deliberately omits Watcher,
// ToolRegistry, Plugin/MCP, and the rest of the full location stack so that
// browsing the project picker never spawns watchers/tools/MCP. Those start only
// when a project is actually opened and the first turn is prompted.
export class Service extends Context.Service<
  Service,
  LayerMap.LayerMap<Location.Ref, BrowseServices, BrowseError>
>()("@opencode/BrowseServiceMap") {
  static get(ref: Location.Ref) {
    return Layer.unwrap(Effect.map(Service, (locations) => locations.get(ref)))
  }
}

export const node = LayerNode.unbound(Service, Node.tags.values.global)

export * as BrowseServiceMap from "./browse-service-map"
