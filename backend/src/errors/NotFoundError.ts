/**
 * Raise this error if a database operation fails because of missing items.
 */
export class NotFoundError extends Error {
    constructor(message?: string) {
        super(`NotFoundError ${message}`);
    }
}
