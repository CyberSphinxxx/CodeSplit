/**
 * Generates a local ID for guest users
 * @returns A string in the format 'local-{timestamp}'
 */
export function generateLocalId(): string {
    return 'local-' + Date.now().toString();
}
