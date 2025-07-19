import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { createUserDto } from './dto/User.dto';
import { RefreshDto } from './dto/auth.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

const dto: createUserDto = {
  login: 'basicUser',
  password: 'examplePassword',
}

const tokens = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken'
}

const refreshDto: RefreshDto = {
  refreshToken: 'refreshToken'
}

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, ConfigService, JwtService, {
        provide: PrismaService,
        useValue: {
          user:{
          findUnique: jest.fn().mockResolvedValue(dto),
          create: jest.fn().mockResolvedValue(dto),
        }}
      }],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a pair of tokens after reg', ()=>{
      const result = service.registration(dto);
      expect(result).toEqual(tokens)
  });
  
  it('should throw an exception if user already created', ()=>{
    jest.spyOn(service, 'registration').mockRejectedValueOnce(new ConflictException)
    try{
      service.registration({
        "login": "testUser",
        "password": "12345678"
      })
    }catch(error){
      expect(error).rejects.toThrow(ConflictException)
  }});
  
  it('should return a pair of tokens after auth', ()=>{
    const result = service.authorization(dto);
    expect(result).toEqual(tokens)
  });
  
  it('should throw an exception if user not found', ()=>{
    jest.spyOn(service, "authorization").mockRejectedValueOnce(new NotFoundException)
    try{
      service.authorization({
        "login": "user",
        "password": "12345678"
      })
    }catch(error){
      expect(error).rejects.toThrow(NotFoundException)
  }});
  
  it('should throw an exception if wrong password', ()=>{
    jest.spyOn(service, "authorization").mockRejectedValueOnce(new NotFoundException)
    try{
      service.authorization({
        "login": "testUser",
        "password": "12345678916149"
      })
    }catch(error){
      expect(error).rejects.toThrow(NotFoundException)
  }});
  
  it('should return a pair of tokens after refresh', ()=>{
    const result = service.refresh(refreshDto);
    expect(result).toEqual(tokens)
  })
});
