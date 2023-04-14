import { Schema, model } from 'mongoose';

const schema = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    last_name: {type: String, required: true}
});

const User = model('User', schema);

export {User};