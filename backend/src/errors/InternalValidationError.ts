/**
 * Raise this error if an internal data validation operation fails.
 */
export class InternalValidationError extends Error {
    constructor(message?: string) {
        super(`InternalValidationError ${message}`);
    }
}
