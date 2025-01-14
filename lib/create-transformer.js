import { computed, onBecomeUnobserved } from "mobx"
import { invariant, addHiddenProp } from "./utils"
var memoizationId = 0
export function createTransformer(transformer, arg2) {
    invariant(
        typeof transformer === "function" && transformer.length < 2,
        "createTransformer expects a function that accepts one argument"
    )
    // Memoizes: object id -> reactive view that applies transformer to the object
    var views = {}
    var onCleanup = undefined
    var debugNameGenerator = undefined
    function createView(sourceIdentifier, sourceObject) {
        var latestValue
        if (typeof arg2 === "object") {
            onCleanup = arg2.onCleanup
            debugNameGenerator = arg2.debugNameGenerator
        } else if (typeof arg2 === "function") {
            onCleanup = arg2
        } else {
            onCleanup = undefined
            debugNameGenerator = undefined
        }
        var prettifiedName = debugNameGenerator
            ? debugNameGenerator(sourceObject)
            : "Transformer-" + transformer.name + "-" + sourceIdentifier
        var expr = computed(
            function() {
                return (latestValue = transformer(sourceObject))
            },
            {
                name: prettifiedName
            }
        )
        var disposer = onBecomeUnobserved(expr, function() {
            delete views[sourceIdentifier]
            disposer()
            if (onCleanup) onCleanup(latestValue, sourceObject)
        })
        return expr
    }
    return function(object) {
        var identifier = getMemoizationId(object)
        var reactiveView = views[identifier]
        if (reactiveView) return reactiveView.get()
        // Not in cache; create a reactive view
        reactiveView = views[identifier] = createView(identifier, object)
        return reactiveView.get()
    }
}
function getMemoizationId(object) {
    var objectType = typeof object
    if (objectType === "string") return "string:" + object
    if (objectType === "number") return "number:" + object
    if (object === null || (objectType !== "object" && objectType !== "function"))
        throw new Error(
            "[mobx-utils] transform expected an object, function, string or number, got: " +
                String(object)
        )
    var tid = object.$transformId
    if (tid === undefined) {
        tid = "memoizationId:" + ++memoizationId
        addHiddenProp(object, "$transformId", tid)
    }
    return tid
}
