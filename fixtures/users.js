var id = require('pow-mongodb-fixtures').createObjectId;

exports.users = [
    {
        _id: id('54d4c9c11771a63013614f75'),
        email: 'angeli na@pastagag.com',
        username: 'Angelina',
        password: '123456'
    },
    {
        _id: id('54d4c9c11771a63013614f76'),
        email: 'clement@pastagag.com',
        username: 'Clément',
        password: '123456'
    },
    {
        _id: id('54d4c9c11771a63013614f77'),
        email: 'david@pastagag.com',
        username: 'David',
        password: '123456'
    }
];