//* QUESTA E' IL CODICE PER L'INSERIMENTO DELLA TABELLA 'NUMERI' NEL DB
//* Questa è la tabella 'a molti' nella relazione generale e dunque verrà trasferita nella tabella
//* a uno

//* Richiedimao infatti il modello numeriTelefono
const numeriTelefono = require('../models/numeriModel')
const router = require('express').Router();

//* Inserimento numeri
router.post('/insert', async (req, res) => {
    try {
        //* Destrutturiamo la tabella 'numeri' e la prendiamo nella sua interezza
        //* Avremmo potuto scrivere => const { tipologia, numeroTelefono } = req.body
        //* Destrutturando riduciamo la facilità della scrittura del codice
        const { numeri } = req.body
        console.log(numeri)
        //* L'inserimento di più numeri avviene con il metodo insertMany(al cui interno riceve un oggetto)
        const newNumeri = await numeriTelefono.insertMany(numeri)


        res.status(200).json({ msg: `Inserimento numero avvenuto con successo`, newNumeri })

    } catch (error) {
        console.log(error)
        res.status(400).json({ msg: `Problemi nell'inserimento di un numero` })
    }
})

module.exports = router;