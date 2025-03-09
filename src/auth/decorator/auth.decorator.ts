import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const IS_ADMIN_KEY = 'isAdmin';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const AdminOnly = () => SetMetadata(IS_ADMIN_KEY, true);
