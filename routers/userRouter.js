const User = require('../models/userModels');
const router = require('express').Router();
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
dotenv.config();

//* Rotta per registrare l'utente
router.post('/register', async (req, res) => {
    try {
        //* Destrutturo i campi del form di registrazione
        const { nome, cognome, email, username, password, passwordVerify } = req.body;
        
        //* Validazione dei campi del form di registrazione
        if(!nome ||
            !cognome ||
            !email ||
            !password ||
            !username ||
            !passwordVerify) {
                return res.status(400).json({ msg: 'Please enter all fields' })
            }

        if(password.length < 6) {
            return res.statu(400).json({ msg: 'Password troppo corta' })
        }

        if(password !== passwordVerify) {
            return res.status(400).json({ msg: 'Password non conformi' })
        }

        //* Creazione dell'account
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ msg: 'Email già presente nel db' })
        }

        //* Hashing della password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        //* Mettiamo i campi della collection dentro ad una costante
        const newUser = await User({
            nome, cognome, email, username, passwordHash
        })

        //* Salviamo nel database
        await newUser.save();

        //* Quando dobbiamo validare la mail di registrazione
        // const emailToken = jwt.sign({ email }, process.env.JWT_SECRET);
        // await sendSignIn(email, emailToken)
        
        
        //* send the token in HTTP-only cookie
        res.status(200).json({ msg: 'Registrazione avvenuta con successo' })


    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Errore nella registrazione' })
    }
})


//* Sistema di Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' })
        }
        //* Cerchiamo la presenza della mail inserita
        const existingUser = await User.findOne({ email }).lean()

        //* Verifichiamo che esista la mail
        if(!existingUser) {
            return res.status(400).json({ msg: 'Wrong mail or password' })
        }

        //* Compariamo la mail con quella hashata
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash)
        if(!passwordCorrect) {
            return res.status(400).json({ msg: 'Wrong mail or password' })
        }

        //* Per prendere i dati dalla tabella user per inserirli nel profile
        const user = existingUser;
        res.cookie("user", JSON.stringify(user), {expiresIn: '15min'})
        const token = jwt.sign({
            user
        }, process.env.JWT_SECRET)

        //* Login ok
        res.cookie("token", token, {
            httpOnly: true,
            credentials: true,
            samesite: true,
            optionsSuccessStatus: 200
        }).json({ msg: 'Login ok' })


    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Login non avvenuto' })
    }
})


//* Sistema di logout
router.get('/logout', (req, res) => {
    res.clearCookie('token').clearCookie('user').status(200).json({ msg: "Logout!!!" })
})

//* rotta per verificare il token
router.get("/jwt-verify", (req, res) => {
    try {
        let token = req.cookies["token"];
        if (!token || token == undefined) {
            return res.status(401).json({ errorMessage: "Unauthorized" })
        }

        //* Validazione del token
        jwt.verify(req.cookies["token"], process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                return res.status(400).json({ msg: "Unauthorized" })
            }
            const { user } = payload;
            token = jwt.sign(payload, process.env.JWT_SECRET)
            res.cookie("user", JSON.stringify(user), { expiresIn: '15min' });
            res.cookie("token", token, {
                httpOnly: true,
                credentials: true,
                samesite: true,
                optionsSuccessStatus: 200
            }).json({ msh: "Authorized" })
        })
    } catch (err) {
        console.error(err)
        res.status(400).json({ errorMessage: "Unauthorized" })
    }

})

module.exports = router;
