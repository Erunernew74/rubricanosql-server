//* QUESTA E' IL CODICE PER L'INSERIMENTO DELLA TABELLA 'INDIRIZZI
//* Questa è la tabella 'a uno' rispetto alla tabella 'a molti' dei numeri di telefono


//* Richiediamo la tabella indirizzi da models (tabella a uno)
const Indirizzi = require('../models/indirizziModel');
const router = require('express').Router();
const mongoose = require('mongoose');

//* Richiedimao anche la tabella numeri (tabella a molti)
const numeriTelefono = require('../models/numeriModel');

//* Rotta test
router.get('/test', (req, res) => {
    res.send(`Test per verificare se è tutto ok`)
})


//* Inserimento indirizzi
//* In questa rotta andremo ad inserire sia i valori della tabella indirizzi che quella della tabella
//* numeri di telefono
router.post('/insert', async (req, res) => {
    try {
        //* Prendo il body della tabella indirizzo CON ANCHE L'OGGETTO numeri dalla tabella numeriTelefono
        const { nome, cognome, numeri } = req.body;
        //* Faccio l'inserimento di molti nuemri per cui uso insertMany e ci passo l'oggetto numeri (cioè l'oggetto che comprende i numeri di telefono)
        const newNumeri = await numeriTelefono.insertMany(numeri)
        //* Creo un oggetto vuoto dove ci inserirò gli id di newNumeri
        const idNumeri = []
        //* Ciclo newNumeri usando forEach(per cui senza creare un nuovo array)
        //* e pusho dentro a idNumeri gli id
        newNumeri.forEach(e => idNumeri.push(e._id))
        // console.log(numeri, newNumeri, idNumeri)
        //* Inserisco dentro ad una variabile newIndirizzo i valori della tabella indirizzi
        //* insieme ai valori (cioè gli id) che ho nella variabile creata appositamente 
        //* per inserire gli id ossia idNumeri
        const newIndirizzo = new Indirizzi({
            nome,
            cognome,
            numeri: idNumeri
        })

        //* Salvo nel database newIndirizzo
        const { id } = await newIndirizzo.save()

        res.status(200).json({ msg: 'Inserimento avvenuto con successo', newIndirizzo, id })

    } catch (error) {
        console.error(error)
        res.status(400).json({})
    }
})

//* Visualizzare tutti gli indirizzi
router.get('/', async (req, res) => {
    const allIndirizzi = await Indirizzi.find({}).populate('numeri')
        .sort({ nome: 'asc' })
    res.json(allIndirizzi)
})

//* Mi permette di visualizzare tutti gli indirizzi con il metodo .find()
//* Con il metodo .popupate('numeri') e passandoci dentro l'oggetto 'numeri' vedrò tutti gli indirizzi
//* con i numeri di telefono associati all'inidirizzo specifico
//* inserito nella pagina => index.jsx di VisualizzaContatti
router.get('/numeri', async (req, res) => {
    const allIndirizzi = await Indirizzi.find().populate('numeri')
        .sort({ nome: 'asc' })
    res.json(allIndirizzi)
})

//* Con questa rotta vedrò un indirizzo specifico, grazie all'id, ovviamente popolato con i numeri a lui associti
router.get('/numeri/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id)
    const allIndirizzi = await Indirizzi.find({ _id: id }).populate('numeri')
        .sort({ nome: 'asc' })
    res.json(allIndirizzi)
})

//* Update di un indirizzo
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cognome, numeri } = req.body;
        console.log(numeri)
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: `Indirizzo non trovato` })
        const indirizzoUpdated = await Indirizzi.findByIdAndUpdate({ _id: id }, { nome, cognome }, { new: true })
        numeri.forEach(async (e) => {
            if (e._id)
                await numeriTelefono.findByIdAndUpdate({ _id: e._id }, { numeroTelefono: e.numeroTelefono, tipologia: e.tipologia }, { new: true })
            else {
                const newNumero = new numeriTelefono({
                    numeroTelefono: e.numeroTelefono,
                    tipologia: e.tipologia
                })//In alternativa const newNumero = new numeriTelefono(e)

                console.log(newNumero)
                const { id: idNumero } = await newNumero.save();

                await Indirizzi.updateOne({
                    _id: id
                }, {
                    $push: { numeri: idNumero }
                }
                )
            }
        })

        res.status(200).json({ msg: `Aggiornamento avvenuto con successo`, indirizzoUpdated })
    } catch (error) {
        console.log(error)
        res.status(400).json({ msg: `Problemi nell'aggiornamento dell'inidirizzo` })
    }
})

router.post('/search', async (req, res) => {
    const { nome, cognome, tipologia, numeroTelefono } = req.body;

    let options = {
        nome: new RegExp(nome, 'i'),
        cognome: new RegExp(cognome, 'i'),
        tipologia: new RegExp(tipologia, 'i'),
        //* nn metto l'array numeri perché devo trattarlo in maniera diversa qua sotto
    }

    //* Ricerca del numero di telefono che fa parte dell'array numeri

    //* creo una variabile ris al cui interno inserisco la ricerca degli indirizzi tramite le opzioni precedenti
    //* e che siano poplati dei rispettivi numeri di telefono
    let ris = await Indirizzi.find(options).populate('numeri')

    if (numeroTelefono) {//* se numeroTelefono esiste allora filtro nuovamente la variabile ris
        //* filtro la variabile ris attraverso l'array numeri
        ris = ris.filter(({ numeri }) => {
            let isValid = false;
            //* scorro l'array numeri senza creare un nuovo array per cui si usa il metodo forEach
            numeri.forEach(e => {
                //* Se le'elemento e.numeroTelefono include il valore nel numeroTelefono che ho ricercato
                if (e.numeroTelefono.includes(numeroTelefono)) {
                    //* Allora setto la variabile d'appoggio a true
                    isValid = true;
                }
            })

            return isValid;
        })
    }

    res.status(200).json({ ris })
})

module.exports = router;