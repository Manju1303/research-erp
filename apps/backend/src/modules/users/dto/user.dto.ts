import {
  IsEmail, IsString, IsOptional, IsBoolean, IsUUID, MinLength, Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'staff@inzovate.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;

  @ApiProperty({ description: 'Role ID to assign' })
  @IsUUID()
  roleId: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class AssignRoleDto {
  @ApiProperty({ description: 'Role ID' })
  @IsUUID()
  roleId: string;
}

export class ToggleUserStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
