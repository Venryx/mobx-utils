/**
 * @private
 */
export class DeepMapEntry<T> {
    private root: Map<any, any>
    private closest: Map<any, any>
    private closestIdx: number = 0
    isDisposed = false

    constructor(private base: Map<any, any>, private args: any[]) {
        let current: undefined | Map<any, any> = (this.closest = this.root = base)
        let i = 0
        for (; i < this.args.length - 1; i++) {
            current = current!.get(args[i])
            if (current) this.closest = current
            else break
        }
        this.closestIdx = i
    }

    exists(): boolean {
        this.assertNotDisposed()
        const l = this.args.length
        return (
            this.closestIdx >= l - 1 &&
            this.closest.has(this.args[l - 1]) &&
            this.closest.get(this.args[l - 1]).has("$finalValue")
        )
    }

    get(): T {
        this.assertNotDisposed()
        if (!this.exists()) throw new Error("Entry doesn't exist")
        return this.closest.get(this.args[this.args.length - 1]).get("$finalValue")
    }

    set(value: T) {
        this.assertNotDisposed()
        const l = this.args.length
        let current: Map<any, any> = this.closest
        // create remaining maps
        for (let i = this.closestIdx; i < l - 1; i++) {
            const m = new Map()
            current.set(this.args[i], m)
            current = m
        }
        this.closestIdx = l - 1
        this.closest = current
        let valueWrapper = new Map()
        valueWrapper.set("$finalValue", value)
        current.set(this.args[l - 1], valueWrapper)
    }

    delete() {
        this.assertNotDisposed()
        if (!this.exists()) throw new Error("Entry doesn't exist")
        const l = this.args.length
        const valueWrapper = this.closest.get(this.args[l - 1])
        valueWrapper.delete("$finalValue")
        if (valueWrapper.size == 0) this.closest.delete(this.args[l - 1])
        // clean up remaining maps if needed (reconstruct stack first)
        let c = this.root
        const maps: Map<any, any>[] = [c]
        for (let i = 0; i < l - 1; i++) {
            c = c.get(this.args[i])!
            maps.push(c)
        }
        for (let i = maps.length - 1; i > 0; i--) {
            if (maps[i].size === 0) maps[i - 1].delete(this.args[i - 1])
        }
        this.isDisposed = true
    }

    private assertNotDisposed() {
        // TODO: once this becomes annoying, we should introduce a reset method to re-run the constructor logic
        if (this.isDisposed) throw new Error("Concurrent modification exception")
    }
}

/**
 * @private
 */
export class DeepMap<T> {
    private store = new Map<any, any>()
    private last: DeepMapEntry<T>

    entry(args: any[]): DeepMapEntry<T> {
        if (this.last) this.last.isDisposed = true

        return (this.last = new DeepMapEntry(this.store, args))
    }
}
