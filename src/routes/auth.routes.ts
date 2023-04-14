import { Router } from 'express';
import { User } from './../models/User';
import bcryptjs from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import config from 'config';

const router = Router();

router.post(
    '/register',
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Минимальная длина пароля - 6 символов').isLength({min: 6}),
        check('name', 'Минимальная длина имени - 1 символ').isLength({min: 1}),
        check('last_name', 'Минимальная длина фамилии - 1 символ').isLength({min: 1})
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные регистрации'
                });
            }

            const {email, password, name, last_name} = req.body;
            const candidate = await User.findOne({email});

            if (candidate) {
                res.status(400).json({message: 'Пользователь с таким email уже существует'});
            } else {
                const hashedPassword = await bcryptjs.hash(password, 12);
                const user = new User({email, password: hashedPassword, name, last_name});

                await user.save();

                res.status(201).json({message: 'Пользователь создан'});
            }
        } catch(e) {
            res.status(500).json({message: `Ошибка регистрации: ${e.message}`});
        }
    }
);

router.post(
    '/login',
    [
        check('email', 'Некорректный email').normalizeEmail().isEmail(),
        check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные'
                });
            }

            const {email, password} = req.body;

            const user = await User.findOne({email});

            if (!user) {
                return res.status(400).json({
                    message: 'Пользователь не найден'
                });
            } else {
                const isMatch = await bcryptjs.compare(password, user.password);

                if (!isMatch) {
                    return res.status(400).json({
                        message: 'Неверный пароль'
                    });
                } else {
                    const token = jwt.sign(
                        { userId: user.id },
                        config.get('jwtSecret'),
                        { expiresIn: '1h' }
                    );

                    res.json({token, userId: user.id});
                }
            }
        } catch(e) {
            res.status(500).json({message: `Ошибка регистрации: ${e.message}`});
        }
    }
);

export {router};