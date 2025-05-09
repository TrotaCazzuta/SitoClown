const nodemailer = require("nodemailer");
const mysql = require("mysql2");
const cron = require("node-cron");

// Configurazione MariaDB
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "la_tua_password",
  database: "Clown_Points"
});

// Lista curiosità (62 giorni)
const curiosita = [
    "Si narra che il primo pagliaccio della storia fosse un notaio in pensione che, sbagliando un test di logica, finì per inciampare nell’eternità della risata umana.",
    "Il cappello a cono, simbolo indiscusso del pagliaccio eccentrico, fu in origine progettato come imbuto per raccogliere le lacrime del pubblico più insensibile.",
    "Alcuni testi rinascimentali riferiscono che Leonardo da Vinci, nei suoi ultimi anni, si dedicò alla progettazione di un naso rosso meccanico in grado di eruttare coriandoli al ritmo del salterio.",
    "L’espressione “ridi come un pagliaccio” nasce da un antico rituale etrusco in cui le risate venivano imbottigliate e vendute nei mercati del sabato.",
    "Il trucco bianco del viso ha origini nella mitologia del Clownicus, divinità minore della leggerezza, il cui volto rifletteva la luna piena e faceva evaporare le preoccupazioni.",
    "Ogni volta che un pagliaccio inciampa, un burocrata perde una virgola in un decreto ministeriale.",
    "Gli stivaletti giganti furono inizialmente ideati per spaventare i topi da circo, notoriamente temuti dai trapezisti poetici.",
    "In alcune tribù perdute dell’Isola dei Serpenti Allegri, si racconta che i pagliacci fossero sacerdoti del buon umore, in grado di curare la febbre con una pernacchia rituale.",
    "Le risate dei pagliacci vengono archiviate in un registro sonoro interdimensionale noto come 'Libro delle Grinze'.",
    "Il cerone bianco che i pagliacci utilizzano è composto da un mix segreto di nostalgia adolescenziale, amido di mais e rimpianti evaporati.",
    "Secondo studi recenti, i migliori pagliacci comunicano telepaticamente con i ficus presenti nei foyer dei teatri.",
    "Il pagliaccio è l’unico essere vivente in grado di suonare simultaneamente tre trombette e l’orgoglio del nonno.",
    "Ogni naso rosso ha un’anima. Alcuni sono sarcastici, altri meditabondi; uno in particolare è iscritto al Partito Radicale.",
    "I pagliacci più anziani parlano una lingua dimenticata fatta solo di suoni onomatopeici e vibrazioni di monociclo.",
    "L’arte del clowning venne considerata nel Medioevo una forma primitiva di diplomazia tra feudi ostili.",
    "Ogni clown ha diritto per costituzione interna ad almeno due sogni lucidi al mese in cui governa un regno fatto di gelatine.",
    "La leggenda narra di un pagliaccio che visse così tanto da diventare un uccello e poi un ricordo in forma di ventaglio.",
    "Il primo litigio registrato tra due pagliacci risale al 1312 ed ebbe come oggetto un panino immaginario.",
    "I clown di stirpe regale possono sbocciare fiori dal cappello ogni volta che un notaio sorride.",
    "I pagliacci non dormono: si mettono in pausa narrativa.",
    "Il loro profumo naturale è un mix di caramello disidratato e carta di giornale francese.",
    "Il monociclo è un mezzo di trasporto accettato in almeno 3 repubbliche non riconosciute delle risate.",
    "La parola 'pagliaccio' deriva dal latino 'Pallium Laxus', ovvero 'coperta sciolta', riferimento al caos ordinato.",
    "Alcuni clown sono anche filosofi da retroscena e compongono trattati sull'ontologia della banana scivolosa.",
    "Ogni clown è custode di una parola dimenticata dalla lingua italiana. La usano solo quando piove dentro.",
    "I pagliacci più devoti meditano osservando la rotazione dei coriandoli al rallentatore.",
    "Il più grande raduno di clown avvenne nel 1993 in un sogno collettivo condiviso da dodici bambini svegli.",
    "Si vocifera che l'ombelico del primo pagliaccio contenesse un circo in miniatura con biglietti gratis.",
    "Il clown porta sempre con sé una tasca contenente una tasca più piccola, dentro la quale dorme il dubbio.",
    "Alcuni pagliacci emettono suoni solo udibili da sedie vuote.",
    "Quando un pagliaccio si specchia, l’universo ride in sottofondo.",
    "I migliori numeri di giocoleria sono stati scritti sotto l’effetto di una tisana alla malinconia.",
    "Il clown non cade mai per caso. È l’equilibrio che si distrae.",
    "Una volta, un pagliaccio riuscì a far ridere un vulcano e da allora il magma ha sapore di zucchero filato.",
    "L'inno dei clown è composto solo da tre note: una acuta, una dubbia e una filosofica.",
    "In alcune culture, i pagliacci sono considerati interpreti divini dei sogni repressi del mercoledì.",
    "Ogni volta che un clown fa una capriola, un’opinione cambia idea.",
    "Il trucco dei clown si applica usando solo cucchiaini d’argento e promesse disilluse.",
    "Il clown piange all’incontrario, come i fiumi del Sahara poetico.",
    "Quando un pagliaccio entra in scena, le ombre si inginocchiano.",
    "La lingua segreta dei clown ha solo due verbi: 'scivolare' e 'intuire'.",
    "Il pagliaccio è l’unico essere a poter fare l’equilibrio emotivo su un ricordo.",
    "I palloncini non esplodono mai davvero: emigrano in un altro spettacolo.",
    "Una volta, un clown scomparve nel nulla lasciando solo l’eco di una barzelletta incompleta.",
    "Il naso rosso è in realtà una bussola: indica sempre la direzione della prossima risata.",
    "Le lacrime di un clown possono curare la noia se raccolte in un barattolo ermetico.",
    "Nessun clown possiede tempo. Lo prendono in prestito dal pubblico.",
    "I clown parlano con le mani, ma gridano con le ginocchia.",
    "Quando un pagliaccio ride da solo, nasce un’idea in un bambino lontano.",
    "Il pagliaccio non ha patria, ma ovunque trova una tenda lo considera casa.",
    "Le marionette dei clown non sono inanimate, semplicemente stanno ascoltando.",
    "Una volta, un clown venne eletto sindaco di un paese che non esisteva più.",
    "I coriandoli sono, in fondo, solo pensieri di carta.",
    "Ogni clown ha un nome segreto che conosce solo il vento.",
    "I pagliacci sono i custodi delle pause tra una risata e l’altra.",
    "Quando inciampano, stanno semplicemente cercando il punto esatto dell’equilibrio interiore.",
    "I fischietti dei clown sono accordati in La sorridente.",
    "Un clown non muore mai, si trasforma in applauso.",
    "Le borse dei clown contengono universi alternativi pieni di scarpe spaiate e biscotti riflessivi.",
    "I numeri comici migliori iniziano sempre con una dimenticanza.",
    "I clown sono gli ultimi a sapere di esserlo, e i primi a perdonarsi per questo.",
    "Alla fine, il clown è solo un poeta che ha scelto di indossare una parrucca."
];

function getCuriositaDelGiorno() {
  const oggi = new Date();
  const giornoAnno = Math.floor((oggi - new Date(oggi.getFullYear(), 0, 0)) / 86400000);
  return curiosita[giornoAnno % curiosita.length];
}

// Configura il tuo SMTP (es. Gmail con app password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "simone.coggio@gmail.com",
    pass: "epgv gkbt qdlm jojt" // Usa una password per le app di Google
  }
});

// Funzione per inviare le email
function inviaEmail() {
  db.query("SELECT name, email FROM Utenti", async (err, results) => {
    if (err) {
      console.error("Errore DB:", err);
      return;
    }

    const curiositaDelGiorno = getCuriositaDelGiorno();

    for (const user of results) {
      try {
        await transporter.sendMail({
          from: '"Clown Points" <carl64026@gmail.com>',
          to: user.email,
          subject: "Curiosità sui pagliacci",
          text: `Ciao ${user.name},\n\nEcco la curiosità di oggi:\n${curiositaDelGiorno}\n\nBuona giornata!`
        });
        console.log(`Email inviata a ${user.email}`);
      } catch (error) {
        console.error(`Errore nell'invio dell'email a ${user.email}:`, error);
      }
    }
  });
}

// Pianifica l'invio ogni giorno alle 9:00
cron.schedule('0 9 * * *', () => {
  console.log("Invio email giornaliero...");
  inviaEmail();
});

// Test immediato
inviaEmail();