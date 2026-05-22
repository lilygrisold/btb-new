import { Request, Response } from 'express';
import { MongoClient, Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { sendResponse } from './utils';

// Load env from current directory, NOT hardcoded production path
require('dotenv').config();

// MongoDB setup
const { REACT_APP_MONGO_URI } = process.env;

if (!REACT_APP_MONGO_URI) {
  throw new Error('REACT_APP_MONGO_URI not set in environment');
}



const client = new MongoClient(REACT_APP_MONGO_URI);
const db: Db = client.db('btb');

//*************************************************************** */
// Types
//*************************************************************** */
interface UserSettings {
  use_bike_paths: boolean;
  [key: string]: unknown;
}

interface User {
  _id: string;
  email: string;
  password: string;
  given_name?: string;
  family_name?: string;
  home?: string;
  work?: string;
  favorites?: unknown[];
  previous_searches?: unknown[];
  settings?: UserSettings;
}

interface LoginBody {
  email: string;
  password: string;
}

interface SignUpBody {
  email: string;
  password: string;
  given_name?: string;
  family_name?: string;
}

interface ProfileUpdateBody {
  _id: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  home?: string;
  work?: string;
}

interface SettingsUpdateBody {
  _id: string;
  settings: UserSettings;
}

interface RouteUpdateBody {
  _id: string;
  route: unknown;
}

//*************************************************************** */
// Returns user data from the database on login
//*************************************************************** */
const handleLogIn = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginBody;

  try {
    await client.connect();
    const user = await db.collection<User>('users').findOne({ email });

    if (!user) {
      res.status(404).json({
        status: 404,
        data: { email },
        message: 'No account found',
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(404).json({
        status: 404,
        data: { email },
        message: 'Invalid Password',
      });
      return;
    }

    res.status(200).json({
      status: 200,
      data: user,
      message: 'Log in success',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      status: 500,
      data: { email },
      message: err instanceof Error ? err.message : 'Login failed',
    });
  }
};

//*************************************************************** */
// Adds new user data when a user submits a sign up request
//*************************************************************** */
const handleSignUp = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as SignUpBody;
  const { email, password } = body;

  try {
    await client.connect();
    const existingUser = await db.collection<User>('users').findOne({ email });

    if (existingUser) {
      res.status(409).json({
        status: 409,
        data: { email },
        message: 'That email already exists',
      });
      return;
    }

    const newUser: User = {
      _id: uuidv4(),
      email,
      password: await bcrypt.hash(password, 10),
      given_name: body.given_name || '',
      family_name: body.family_name || '',
      favorites: [],
      previous_searches: [],
      settings: { use_bike_paths: true },
      home: '',
      work: '',
    };

    const result = await db.collection<User>('users').insertOne(newUser);

    if (result.acknowledged) {
      res.status(200).json({
        status: 200,
        data: newUser,
        message: 'Sign up success',
      });
    } else {
      res.status(500).json({
        status: 500,
        data: newUser,
        message: 'Sign up request failed',
      });
    }
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      status: 500,
      data: { email },
      message: err instanceof Error ? err.message : 'Sign up failed',
    });
  }
};

//*************************************************************** */
// Updates user profile
//*************************************************************** */
const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as ProfileUpdateBody;
  const { _id, given_name, family_name, email, home, work } = body;

  try {
    await client.connect();

    const checkUser = await db.collection<User>('users')
      .find({ _id })
      .toArray();

    if (checkUser.length === 0) {
      sendResponse(res, 404, _id, 'User not found');
      return;
    }

    await db.collection<User>('users').findOneAndUpdate(
      { _id },
      {
        $set: {
          given_name: given_name || '',
          family_name: family_name || '',
          email: email || '',
          home: home || '',
          work: work || '',
        },
      }
    );

    const updatedUser = await db.collection<User>('users')
      .find({ _id })
      .toArray();

    res.status(200).json({
      status: 200,
      data: updatedUser,
      message: 'User profile successfully updated',
    });
  } catch (err) {
    console.error('Failed to update user:', err);
    sendResponse(res, 500, _id, err instanceof Error ? err.message : 'Update failed');
  }
};

//*************************************************************** */
// Updates user settings
//*************************************************************** */
const updateUserSettings = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as SettingsUpdateBody;
  const { _id, settings } = body;

  try {
    await client.connect();

    const checkUser = await db.collection<User>('users')
      .find({ _id })
      .toArray();

    if (checkUser.length === 0) {
      sendResponse(res, 404, _id, 'User not found');
      return;
    }

    await db.collection<User>('users').findOneAndUpdate(
      { _id },
      { $set: { settings } }
    );

    const updatedUser = await db.collection<User>('users')
      .find({ _id })
      .toArray();

    res.status(200).json({
      status: 200,
      data: updatedUser,
      message: 'User settings successfully updated',
    });
  } catch (err) {
    console.error('Failed to update settings:', err);
    sendResponse(res, 500, _id, err instanceof Error ? err.message : 'Update failed');
  }
};

//*************************************************************** */
// Adds route to user profile
//*************************************************************** */
const updateUserRoutes = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as RouteUpdateBody;
  const { _id, route } = body;

  try {
    await client.connect();

    const checkUser = await db.collection<User>('users')
      .find({ _id })
      .toArray();

    if (checkUser.length === 0) {
      sendResponse(res, 404, _id, 'User not found');
      return;
    }

    const result = await db.collection<User>('users').findOneAndUpdate(
      { _id },
      {
        $push: {
          previous_searches: {
            $each: [route],
            $position: 0,
          },
        },
      }
    );

    if (result) {
      sendResponse(res, 200, body, 'Route successfully added');
    } else {
      sendResponse(res, 404, _id, 'The route was not found');
    }
  } catch (err) {
    console.error('Failed to add route:', err);
    sendResponse(res, 500, _id, err instanceof Error ? err.message : 'Failed to add route');
  }
};

//*************************************************************** */
// Retrieve user profile based on their id
//*************************************************************** */
const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const { _id } = req.params;

  try {
    await client.connect();
    const user = await db.collection<User>('users').findOne({ _id });

    if (user) {
      res.status(200).json({
        status: 200,
        data: user,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: 'No user to display',
      });
    }
  } catch (err) {
    console.error('Failed to get user:', err);
    res.status(500).json({
      status: 500,
      message: err instanceof Error ? err.message : 'Failed to retrieve user',
    });
  }
};

//*************************************************************** */
// Export handlers
//*************************************************************** */
export {
  handleLogIn,
  handleSignUp,
  updateUserProfile,
  getUserProfile,
  updateUserRoutes,
  updateUserSettings,
};