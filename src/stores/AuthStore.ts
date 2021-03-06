import {action, makeAutoObservable, runInAction} from 'mobx';
import {format, ignore} from "mobx-sync";

import {ApiService} from "../services/api/ApiService";
import {ERRORS, Profile as ProfileResponse, ROLE, UsernameRegisterDto} from '@nexcella/comein-api';

export type Profile = {
  id: string,
  username: string,
  name: string,
  phone: string,
  roles: ROLE[]
  isAdmin: boolean
}
export type LoginData = {
  username: string,
  password: string
}

export type RegisterData = {
  name: string,
  username: string,
  phone: string,
  password: string,
}

export type ForgotData = {
  username: string,
}

export class AuthStore {
  @ignore
  isLoading = false;

  @ignore
  error?: string;

  isLoggedIn = false;
  successForgotEmail = false

  @format(
    (hash) => hash ? atob(hash) : undefined,
    (token?: string) => token ? btoa(token) : undefined
  )
  token?: string

  @format(
    (hash) => hash ? atob(hash) : undefined,
    (refreshToken?: string) => refreshToken ? btoa(refreshToken) : undefined
  )

  refreshToken?: string
  tokenTtl?: Date
  profile?: Profile;

  @ignore
  private apiService: ApiService;

  constructor(apiService: ApiService) {
    makeAutoObservable(this);
    this.apiService = apiService;
  }

  @action
  login({username, password}: LoginData) {
    this.isLoading = true;
    this.error = undefined;
    this.apiService.auth.usernameLogin({username, password})
      .then((response) => {
        runInAction(() => {
          if ("success" in response) {
            this.setProfile(response.success.profile);
          } else {
            switch (response.error.code) {
              case ERRORS.AUTH.INCORRECT_USERNAME:
                this.error = 'incorrect_username';
                break;
              case ERRORS.VALIDATION.REQUEST:
                this.error = 'validation';
                break;
              default:
                this.error = 'internal'
            }
          }
          this.isLoading = false;
        })
      });
  }

  @action
  usernameRegister(data: UsernameRegisterDto) {
    this.isLoading = true;
    this.error = undefined;
    this.apiService.auth.usernameRegister({...data, autologin: true})
      .then((response) => {
        runInAction(() => {
          if ("success" in response) {
            this.setProfile(response.success.profile);
          } else {
            switch (response.error.code) {
              case ERRORS.AUTH.USER_ALREADY_EXIST:
                this.error = 'user_exist';
                break;
              case ERRORS.VALIDATION.REQUEST:
                this.error = 'validation';
                break;
              default:
                this.error = 'internal'
            }
          }
        })
      })
      .finally(() => {
        runInAction(() => {
          this.isLoading = false
        })

      })
  }

  @action
  usernameForgot(data: ForgotData) {
    this.isLoading = true;
    this.error = undefined;
    this.apiService.auth.usernameForgot(data)
      .finally(() => {
        runInAction(() =>{
          this.isLoading = false
          this.successForgotEmail = true;
        })
      })
  }

  @action
  clear() {
    this.successForgotEmail = false;
    this.error = undefined
  }

  @action
  logout() {
    this.isLoggedIn = false;
    this.isLoading = false;
    this.profile = undefined;
    this.token = undefined;
    this.refreshToken = undefined;
    // @TODO request logout from service
  }

  @action
  getProfile() {
    this.apiService.auth.profile()
      .then((response) => {
        runInAction(() => {
          if ("success" in response) {
            this.profile = {
              ...response.success.profile,
              isAdmin: response.success.profile.roles.includes('admin')
            };
          }
        })
      })
  }

  @action
  private setProfile(profile: ProfileResponse) {
    const {id, token, username, name, phone, refreshToken, ttl, roles = []} = profile;
    this.profile = {id, username, roles, name, phone, isAdmin: roles.includes('admin')};
    if (token && ttl) {
      this.token = token;
      this.refreshToken = refreshToken;
      this.tokenTtl = new Date(ttl);
      this.isLoggedIn = true;
    }
  }

}
