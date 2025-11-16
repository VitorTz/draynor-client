


export function normalizeAuthorRole(role: string) {
    if (role === "Author") return "Story"
    if (role === "Artist") return "Art"
    return role
}