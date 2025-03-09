import { Controller } from '@nestjs/common';
import { AddressService } from './services/address.service';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}
}
