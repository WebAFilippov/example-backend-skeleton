import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

import userModel from "../models/userModel.js";
import { eventLog } from "../middleware/logger.js";

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Все поля обязательны" });
  }

  if (username.length > 30) {
    return res.status(400).json({ message: "Максимальная длина логина 30" });
  }

  if (password.length < 4) {
    return res.status(400).json({ message: "Минимальная длина пароля 4" });
  }

  const regex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  if (!regex.test(email)) {
    return res.status(400).json({ message: "Неверный email" });
  }

  const duplicate = await userModel.findOne({ email }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Такой емайл уже занят" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const accessToken = await jwt.sign(
    { email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30s" }
  );

  const refreshToken = await jwt.sign(
    { email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
    refreshToken: refreshToken,
  });

  if (user) {
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res
      .status(201)
      .json({ message: `Пользователь ${username} создан`, accessToken });
    eventLog(`Профиль создан =  ${username} ${email}`, "reqLog.log");
  } else {
    res.status(400).json({ message: "Ошибка: неверная модель Юзера" });
  }
});

export { createUser };
