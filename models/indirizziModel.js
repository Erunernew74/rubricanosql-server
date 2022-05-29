const mongoose = require('mongoose');

const indirizziSchema = new mongoose.Schema({
    nome: {
        type: String
    },
    cognome: {
        type: String
    },
    numeri: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'numeri'
    }]
})

const Indirizzi = mongoose.model('indirizzi', indirizziSchema);
module.exports = Indirizzi;