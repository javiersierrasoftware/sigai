const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  identification: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['DOCENTE', 'ADMIN', 'ADMINDIUS', 'ADMINGESTION', 'ADMINCIARP', 'ADMINVICE', 'vicerrectoria'],
    default: 'DOCENTE' 
  },
  profile: { type: Object, default: {} }
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const docentes = [
  { fullName: "JOHN ARTURO BUELVAS PARRA", identification: "78689776" },
  { fullName: "SANTANDER JOSE DE LA OSSA GUERRA", identification: "18856646" },
  { fullName: "WILLIAM ALEJANDRO NIEBLES NUÑEZ", identification: "8565794" },
  { fullName: "YANETH PATRICIA ROMERO ALVAREZ", identification: "50926826" },
  { fullName: "AYLIN PATRICIA PERTUZ MARTINEZ", identification: "64553767" },
  { fullName: "WILSON CADRAZCO PARRA", identification: "9134585" },
  { fullName: "ALVARO SANTAMARIA ESCOBAR", identification: "72171201" },
  { fullName: "CARLOS MIGUEL PACHECO RUIZ", identification: "78733146" },
  { fullName: "CLAUDIA PATRICIA ROJAS MARTINEZ", identification: "22867162" },
  { fullName: "RITA LUZ MARQUEZ VIZCAINO", identification: "22636075" },
  { fullName: "JENNY PAOLA CORREDOR PRADO", identification: "38360708" },
  { fullName: "JORGE DAVID MERCADO GOMEZ", identification: "3839639" },
  { fullName: "JUAN MANUEL DIAZ SOTO", identification: "94374586" },
  { fullName: "LILIANA SOLANO FLOREZ", identification: "32298304" },
  { fullName: "PEDRO JOSE BLANCO TUIRAN", identification: "9037407" },
  { fullName: "LEIDYS DEL CARMEN MURILLO RAMOS", identification: "1063142230" },
  { fullName: "ALDO FABRIZZIO COMBARIZA MONTAÑEZ", identification: "88157560" },
  { fullName: "ALVARO ANGEL ARRIETA ALMARIO", identification: "78745742" },
  { fullName: "DAIRO HUMBERTO MARIN CASAS", identification: "14011155" },
  { fullName: "EDUAR BEJARANO MARTINEZ", identification: "92527403" },
  { fullName: "JAVIER DARIO BELTRAN HERRERA", identification: "6459649" },
  { fullName: "JULIO CESAR CANTILLO PADRON", identification: "92543851" },
  { fullName: "MARIA CLAUDIA PACHECO BARROS", identification: "64718101" },
  { fullName: "JOSE ANTONIO CORTINA GUERRERO", identification: "73075183" },
  { fullName: "KAREN CATALINA LEAL ACOSTA", identification: "23182564" },
  { fullName: "HERNAN JAVIER GUZMAN MURILLO", identification: "1003737518" },
  { fullName: "TANIA INES MARTINEZ MEDRANO", identification: "64576560" },
  { fullName: "ALBERTO GREGORIO CASTELLANO MONTIEL", identification: "841310" },
  { fullName: "LEON JULIO ARANGO BUELVAS", identification: "73091837" },
  { fullName: "JOSE MARCELO TORRES ORTEGA", identification: "1047381274" },
  { fullName: "GUSTAVO A GONZALEZ PALOMINO", identification: "94372528" },
  { fullName: "YAHILINA SILVEIRA PEREZ", identification: "640508" },
  { fullName: "CARMEN CECILIA ALVIZ TOUS", identification: "64540873" },
  { fullName: "GLORIA VILLAREAL AMARIS", identification: "33135580" },
  { fullName: "HILDA EVELIA PRIAS VANEGAS", identification: "41631626" },
  { fullName: "LUZ MARINA GARCIA GARCIA", identification: "64540506" },
  { fullName: "MARA OSORNO NAVARRO", identification: "64567993" },
  { fullName: "MILENA PEREIRA PEÑATE", identification: "64558600" },
  { fullName: "WENDY JOHANA GOMEZ DOMINGUEZ", identification: "1103217494" },
  { fullName: "ADRIANA CONTRERAS MACHADO", identification: "64551816" },
  { fullName: "HELENA GUERRERO DE CABALLERO", identification: "45421339" },
  { fullName: "EUSTORGIO JOSE AMED SALAZAR", identification: "92539325" },
  { fullName: "RINA MARTINEZ CARDEÑO", identification: "32819238" },
  { fullName: "DAVID ARTURO GALVAN BORJA", identification: "73582520" },
  { fullName: "OMAR JAVIER SUAREZ TAMARA", identification: "10772344" },
  { fullName: "CARLOS CABRA CABRA", identification: "388367" },
  { fullName: "WILSON ENRIQUE ROSADO MERCADO", identification: "8646465" },
  { fullName: "ALEXANDER FRANCISCO PEREZ CORDERO", identification: "2759289" },
  { fullName: "KARINA UCROS FUENMAYOR", identification: "64867060" },
  { fullName: "KARINA LASTRE MEZA", identification: "32930536" },
  { fullName: "BEATRIZ ELENA MIRANDA CONTRERAS", identification: "64553718" },
  { fullName: "MARINELA ALVAREZ BORRERO", identification: "64576585" },
  { fullName: "MARIVEL MONTES ROTELA", identification: "64564618" },
  { fullName: "PATRICIA BERTEL PESTANA", identification: "64554736" },
  { fullName: "ELVIS JUDITH HERNANDEZ RAMOS", identification: "50967861" },
  { fullName: "JAIRO GUADALUPE SALCEDO MENDOZA", identification: "92498358" },
  { fullName: "LILIANA POLO CORRALES", identification: "33223428" },
  { fullName: "MARIA JOSE TAVERA QUIROZ", identification: "26202566" },
  { fullName: "YELITZA DEL ROSARIO AGUAS MENDOZA", identification: "64558177" },
  { fullName: "JOSE GABRIEL SERPA FAJARDO", identification: "92518098" },
  { fullName: "CARLOS ALBERTO GARCIA MOGOLLON", identification: "78752581" },
  { fullName: "FERNANDO DARIO HERNANDEZ TABOADA", identification: "92533151" },
  { fullName: "JORGE EMILIO HERNANDEZ RUYDIAZ", identification: "92534321" },
  { fullName: "ISMAEL SEGUNDO SANDOVAL ASSIA", identification: "9311838" },
  { fullName: "ALFREDO CARLOS FERNANDEZ QUINTERO", identification: "19174796" },
  { fullName: "ARMANDO RAFAEL GUTIERREZ RIBON", identification: "8662569" },
  { fullName: "JUSTO RAFAEL FUENTES CUELLO", identification: "6820995" },
  { fullName: "HERALDO SEGUNDO ALVIZ SANTOS", identification: "9305512" },
  { fullName: "QUELBIS ROMAN QUINTERO BERTEL", identification: "92515346" },
  { fullName: "GASTON BALLUT DAJUD", identification: "92510986" },
  { fullName: "RODRIGO GREGORIO HERNANDEZ AVILA", identification: "92521983" },
  { fullName: "ALEX JOSE BRACAMONTE MIRANDA", identification: "92523515" },
  { fullName: "CARLOS ANDRES MILLAN PARAMO", identification: "1102812924" },
  { fullName: "CARLOS JOSE MEDINA MARTINEZ", identification: "92552625" },
  { fullName: "FERNANDO JOVE WILCHES", identification: "92513081" },
  { fullName: "GUILLERMO ENRIQUE GUTIERREZ RIBON", identification: "6815233" },
  { fullName: "JHON JAIRO FERIA DIAZ", identification: "15051938" },
  { fullName: "JOSE RODRIGO HERNANDEZ AVILA", identification: "92531656" },
  { fullName: "JAVIER EMILIO SIERRA CARRILLO", identification: "92559360" },
  { fullName: "JOSE LUIS LOPEZ PRADO", identification: "9023493" },
  { fullName: "JOSE ANTONIO ARAQUE GALLARDO", identification: "88030950" },
  { fullName: "ALEJANDRO SALLYTH GUERRERO HERNANDEZ", identification: "7632688" },
  { fullName: "BORIS ALEXANDER MEDINA SALGADO", identification: "92530444" },
  { fullName: "RAMON ANTONIO ALVAREZ LOPEZ", identification: "88031483" },
  { fullName: "ADOLFO BERNARDO ARRIETA CARRASCAL", identification: "8741558" },
  { fullName: "XIMENA PAOLA ARIAS BUENDIA", identification: "1116778863" },
  { fullName: "ALEJANDRO TORO CRIOLLO", identification: "9729528" },
  { fullName: "MIRYAM NIÑOPUELLO", identification: "33214530" },
  { fullName: "JAMES CASTAÑO MENDEZ", identification: "16630719" },
  { fullName: "LILIANA MARGARITA VITOLA GARRIDO", identification: "64581012" },
  { fullName: "MARIA FERNANDA SIERRA CARRILLO", identification: "22865792" },
  { fullName: "MARIO ENRIQUE ALMANZA CARO", identification: "73183430" },
  { fullName: "MELBA LILIANA VERTEL MORINSON", identification: "50897102" },
  { fullName: "OSMIN OBERTO FERRER VILLAR", identification: "78707014" },
  { fullName: "JUDITH DEL CARMEN BERTEL BEHAINE", identification: "64567149" },
  { fullName: "HUGO ALAIN ZAPATA CEBALLOS", identification: "7141323" },
  { fullName: "HUGO ALBERTO BRANGO GARCIA", identification: "10775518" },
  { fullName: "IVAN DARIO NUÑEZ OROZCO", identification: "92504081" },
  { fullName: "JAIRO ESCORCIA MERCADO", identification: "92502091" },
  { fullName: "JOSE EDUARDO SANABRIA", identification: "683223" },
  { fullName: "JUAN ALBERTO BARBOZA RODRIGUEZ", identification: "92556044" },
  { fullName: "SANDRA PATRICIA ROJAS SEVILLA", identification: "64588973" },
  { fullName: "ALMA LUZ LUNA MANJARREZ", identification: "23182568" },
  { fullName: "EDGAR VERGARA DAGOBETH", identification: "92499038" },
  { fullName: "GUILLERMO ENRIQUE DEL CARMEN CARRIAZO SAM", identification: "92126149" },
  { fullName: "JAIRO VERGARA CORENA", identification: "92529542" },
  { fullName: "NERLIS PAOLA PAJARO CASTRO", identification: "1044908005" },
  { fullName: "RINA PAOLA BARRIOS BARRETO", identification: "1103095393" },
  { fullName: "JAIME LEON DE LA OSSA VELASQUEZ", identification: "10534276" },
  { fullName: "PEDRO CARABALLO GRACIA", identification: "9133043" },
  { fullName: "RAFAEL JOSE OTERO ARROYO", identification: "10771342" },
  { fullName: "RENE MAURICIO PATIÑO PARDO", identification: "79387476" },
  { fullName: "DIEGO FERNANDO CARRILLO GONZALEZ", identification: "74150738" },
  { fullName: "DONICER EDUARDO MONTES VERGARA", identification: "92506683" }
];

async function seedDocentes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Attempt to drop the old email_1 index which was created without sparse: true
    try {
      await User.collection.dropIndex('email_1');
      console.log('Successfully dropped old email_1 index.');
    } catch (e) {
      console.log('No old email_1 index to drop or error dropping:', e.message);
    }

    // Force Mongoose to sync indexes (so it creates the sparse one for email)
    await User.syncIndexes();
    console.log('Indexes synchronized.');

    let seededCount = 0;
    for (const doc of docentes) {
      // Check if user exists by identification
      const existingUser = await User.findOne({ identification: doc.identification });
      
      if (!existingUser) {
        // Hash identification as password
        const hashedPassword = await bcrypt.hash(doc.identification, 10);
        
        await User.create({
          fullName: doc.fullName,
          identification: doc.identification,
          password: hashedPassword,
          role: 'DOCENTE',
          profile: {
            contractType: 'PLANTA' // preconfigured as Planta
          }
        });
        seededCount++;
      } else {
        // Update to role 'DOCENTE' and ensure Planta
        existingUser.role = 'DOCENTE';
        if (!existingUser.profile) {
          existingUser.profile = { contractType: 'PLANTA' };
        } else {
          existingUser.profile.contractType = 'PLANTA';
        }
        await existingUser.save();
      }
    }

    console.log(`Seeding complete. Created ${seededCount} new docentes. Updated existing ones.`);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding docentes:', error);
    process.exit(1);
  }
}

seedDocentes();
