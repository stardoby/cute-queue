/**
 * Raise this error if a data validation operation fails on user-provided data 
 */
export class ExternalValidationError extends Error {
    constructor(message?: string) {
        super(`ExternalValidationError ${message}`);
    }
}
