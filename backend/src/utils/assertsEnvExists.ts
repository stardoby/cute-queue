import assert from "node:assert";

export function assertEnvExists(value: string | undefined): asserts value is string {
    assert(typeof value !== 'undefined')
}