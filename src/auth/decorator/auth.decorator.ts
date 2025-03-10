import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const IS_ADMIN_KEY = 'isAdmin';
export const CHECK_OWNERSHIP_KEY = 'checkOwnership';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const AdminOnly = () => SetMetadata(IS_ADMIN_KEY, true);
export const CheckOwnerShip = () => SetMetadata(IS_ADMIN_KEY, true);
