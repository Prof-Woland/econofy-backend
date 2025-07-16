import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

const user = {
  login: 'basicUser',
  password: 'examplePassword',
}

const tokens = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken'
}

const token = {
  refreshToken: 'refreshToken'
}

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [ConfigService, JwtService, {
        provide: AuthService,
        useValue:{
          registration: jest.fn().mockResolvedValue(tokens),
          login: jest.fn().mockResolvedValue(tokens),
          refresh: jest.fn().mockResolvedValue(token)
        }
      }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a pair of tokens after reg', ()=>{
    const result = controller.registration(user);
    expect(result).toEqual(tokens)
  });

  it('should throw an exception if user already created', ()=>{
    jest.spyOn(service, 'registration').mockRejectedValueOnce(new ConflictException)
    try{
      controller.registration({
        "login": "testUser",
        "password": "12345678"
      })
    }catch(error){
      expect(error).toBeInstanceOf(ConflictException)
  }});

  it('should return a pair of tokens after auth', ()=>{
    const result = controller.login(user);
    expect(result).toEqual(tokens)
  });

  it('should throw an exception if user not found', ()=>{
    jest.spyOn(service, "authorization").mockRejectedValueOnce(new NotFoundException)
    try{
      controller.login({
        "login": "user",
        "password": "12345678"
      })
    }catch(error){
      expect(error).toBeInstanceOf(NotFoundException)
  }});

  it('should throw an exception if wrong password', ()=>{
    jest.spyOn(service, "authorization").mockRejectedValueOnce(new NotFoundException)
    try{
      controller.login({
        "login": "testUser",
        "password": "12345678916149"
      })
    }catch(error){
      expect(error).toBeInstanceOf(NotFoundException)
  }});

  it('should return a pair of tokens after refresh', ()=>{
    const result = controller.refresh(token);
    expect(result).toEqual(tokens)
  })
});
