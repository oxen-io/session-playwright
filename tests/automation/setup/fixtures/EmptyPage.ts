import type { Page } from '@playwright/test';
import { newUser } from '../new_user';
import { User } from '../../types/testing';
/* eslint-disable no-useless-constructor, no-empty-function */

export class EmptyWindow {
  public readonly page: Page;

  constructor(public readonly window: Page) {
    this.page = window;
  }

  async createUser(displayName: string) {
    return newUser(this.page, displayName);
  }
}

export class NewUserWindow {
  public readonly window: EmptyWindow;
  public readonly user: User;

  constructor(window: EmptyWindow, user: User) {
    this.window = window;
    this.user = user;
  }
}

export class OneFriendWindow extends NewUserWindow {
  constructor(window: NewUserWindow) {
    super(window);
  }

  async plop() {}
}
