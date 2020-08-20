import { Request, Response } from 'express';
import { hash } from 'bcryptjs';
import { uuid } from 'uuidv4';

import db from '../database/connection';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  whatsapp: string;
  bio: string;
}

export default class UsersController {

  async show(request: Request, response: Response) {

    try {
      const { id } = request.user;

      const userArray: User[] = await db('users').where('users.id', '=', id);
      const user = userArray[0];

      delete user.password;

      const classArray = await db('classes').where('classes.user_id', '=', id);
      const proffyClass = classArray[0];

      const classSchedule = await db('class_schedule')
        .where('class_schedule.class_id', '=', proffyClass.id);
      
      return response.json({ user, user_class: proffyClass, class_schedule: classSchedule });
    } catch (err) {
      return response.status(400).json({ err: err.message });
    }
  }

  async create(request: Request, response: Response) {
    try {
      const { name, email, password, confirm_password } = request.body;

      const userExists = await db('users').where({ email, });

      if (userExists[0]) {
        throw new Error("User already exists");
      }

      if (password !== confirm_password) {
        throw new Error("Passwords doesn't match");
      }

      const hashedPassword = await hash(password, 8);

      const user: User[] = await db('users').insert({
        id: uuid(),
        name,
        email,
        password: hashedPassword,
      });

      return response.json(user);
    } catch (err) {
      return response.status(400).json({ err: err.message });
    }
  }
}
