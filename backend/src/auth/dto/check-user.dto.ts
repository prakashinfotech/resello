import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckUserDto {
  @ApiProperty({
    description: 'Email or phone number to check',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;
}
