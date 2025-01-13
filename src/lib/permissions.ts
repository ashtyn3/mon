export type Permission = number;

export interface Permissions {
    /*
        Can manage customer accounts.
    */
    bookKeeper: boolean,
    /*
        Can manage customer accounts, vendor accounts, look at synced banks.
    */
    standard: boolean,
    /*
        Can view all information.
    */
    viewer: boolean,
    /*
        Everything.
    */
    admin: boolean,
    /*
        Nothing awaiting role assignment.
    */
    pending: boolean,
}

export function fromPermission(num: Permission): Permissions {
    return {
        bookKeeper: !!(num & 0b1),
        standard: !!(num >> 1 & 0b1),
        viewer: num == 0,
        admin: !!(num >> 2 & 0b1),
        pending: !!(num >> 3 & 0b1)
    }
}

export function PermissionsFrom(p: Permissions): Permission {
    if (p.bookKeeper) {
        return 0b001
    }
    if (p.standard) {
        return 0b010
    }
    if (p.admin) {
        return 0b100
    }
    if (p.pending) {
        return 0b1000
    }
    if (p.viewer) {
        return 0
    }
    return 0
}
