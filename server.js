const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: [`http://localhost:3000`],
    credentials: true,
    samesite: true,
    optionsSuccessStatus: 200,
    exposedHeaders: ["set-cookie"],
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE", "PATCH", "OPTIONS"]
}));

app.use(cookieParser());

const port = process.env.PORT || 8030;

app.get('/', (req, res) => {
    res.send({ msg: 'Ciao mondo bellissimo' })
})

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) return console.error(err)
    console.log(`Connected to mongoDB`)
})

//* Route che gestisce la tabella indirizzi 
const indirizziRouter = require('./routers/indirizziRouter');
app.use('/indirizzi', indirizziRouter);

//* Route che gestisce la tabella numeriTelefono
const numeriRouter = require('./routers/numeriRouter');
app.use('/numeri', numeriRouter);

//* Rotte per la registrazione - login ecc....
const userRouter = require('./routers/userRouter');
app.use('/auth', userRouter)

app.listen(port, () => console.log(`Server in ascolto sulla porta ${port}`))

