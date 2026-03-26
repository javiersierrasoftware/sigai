
import mongoose from 'mongoose';

const MONGODB_URI="mongodb://ticsoft:Ticsoft.123@127.0.0.1:27017/DB_SIGAIUniSucre?directConnection=true&authMechanism=SCRAM-SHA-256&authSource=admin"

const groups = [
  { name: "INVESTIGACIONES BIOMÉDICAS", category: "A1", leaderName: "EDUAR ELIAS BEJARANO MARTINEZ" },
  { name: "ESTADÍSTICA Y MODELAMIENTO MATEMÁTICO APLICADO A CALIDAD EDUCATIVA", category: "B", leaderName: "MELBA LILIANA VERTEL MORRINSON" },
  { name: "TEORÍA DE LA MATERIA CONDENSADA", category: "C", leaderName: "OMAR JAVIER SÚAREZ TÁMARA" },
  { name: "PROYECTO PEDAGOGICO PROPED", category: "C", leaderName: "JUAN ALBERTO BARBOZA RODRIGUEZ" },
  { name: "EVOLUCION Y SISTEMATICA TROPICAL", category: "C", leaderName: "JORGE MERCADO GOMEZ" },
  { name: "BIOTECNOLOGÍA VEGETAL DE LA UNIVERSIDAD DE SUCRE", category: "C", leaderName: "JAVIER DARIO BELTRAN HERRERA" },
  { name: "IN SILICO", category: "C", leaderName: "ALDO FABRIZIO COMBARIZA MONTAÑEZ" },
  { name: "CONSERVACIÓN DEL RECURSO HÍDRICO Y ALIMENTOS", category: "C", leaderName: "ADOLFO CONSUEGRA SOLORZANO" },
  { name: "GRUPO DE INVESTIGACION EN PRODUCTOS NATURALES (GIPNUS)", category: "C", leaderName: "RITA LUZ MARQUEZ VIZCAINO" },
  { name: "DESARROLLO E INNOVACION DE MATERIALES AVANZADOS", category: "C", leaderName: "ALVARO ARRIETA ALMARIO" },
  { name: "TECNOCRITO", category: "B", leaderName: "ADOLFO ARRIETA CARRASCAL" },
  { name: "BIOLOGÍA DE MICROORGANISMOS (GIBM)", category: "C", leaderName: "YEREMIS MERIÑO CABRERA" },
  { name: "ECOFISIOLOGIA", category: "B", leaderName: "JENNY CORREDOR PRADO" },
  { name: "ANÁLISIS FUNCIONAL Y ECUACIONES DIFERENCIALES-AFED", category: "A1", leaderName: "OSMIN FERRER VILLAR" },
  { name: "BIOLOGIA EVOLUTIVA", category: "C", leaderName: "LILIANA SOLANO FLOREZ" },
  { name: "SALUD – GINDES", category: "C", leaderName: "MARA OSORNO NAVARRO" },
  { name: "CUIDADO DE LA SALUD", category: "C", leaderName: "ADRIANA CONTRERAS" },
  { name: "FONOCIENCIA", category: "C", leaderName: "MARIVEL MONTES ROTELA" },
  { name: "GRUPO INTERDISCIPLINAR DE FÍSICA TEÓRICA Y APLICADA (GIFTA)", category: "C", leaderName: "WILSON ROSADO MERCADO" },
  { name: "REPRODUCCIÓN Y MEJORAMIENTO GENÉTICO ANIMAL", category: "A", leaderName: "DONICER EDUARDO MONTES VERGARA" },
  { name: "BIODIVERSIDAD TROPICAL", category: "C", leaderName: "ALCIDES CASIMIRO SAMPEDRO MARIN" },
  { name: "BIOPROSPECCION AGROPECUARIA", category: "A", leaderName: "ALEXANDER PEREZ CORDERO" },
  { name: "ESTRATEGIA Y GESTIÓN", category: "A", leaderName: "CARLOS MIGUEL PACHECO RUIZ" },
  { name: "GESTIÓN DE LA PRODUCCIÓN Y LA CALIDAD ORGANIZACIONAL", category: "C", leaderName: "ALVARO ENRIQUE SANTAMARIA ESCOBAR" },
  { name: "OIKOS", category: "A", leaderName: "LEON JULIO ARANGO BUELVAS" },
  { name: "PROCESOS AGROINDUSTRIALES Y DE DESARROLLO SOSTENIBLE – PADES", category: "A", leaderName: "JAIRO GUADALUPE SALCEDO MENDOZA" },
  { name: "DESARROLLO E INNOVACIÓN DE PROCESOS ALIMENTARIOS – DESINPA", category: "C", leaderName: "MARIA TAVERA QUIROZ" },
  { name: "GESTIÓN INTEGRAL DE PROCESOS, MEDIO AMBIENTE Y CALIDAD – GIMAC", category: "C", leaderName: "YELITZA AGUAS MENDOZA" },
  { name: "GRESA", category: "C", leaderName: "ALFREDO FERNANDEZ QUINTERO" },
  { name: "GRUPO DE INVESTIGACION MANGLAR", category: "B", leaderName: "JAVIER EMILIO SIERRA" },
  { name: "GIGEVIS: GEOTECNIA, VÍAS Y SANITARIA", category: "C", leaderName: "JHON JAIRO FERIA" },
  { name: "ESTROPTI", category: "C", leaderName: "CARLOS MILLÁN" },
  { name: "BIOINDUSTRIAS", category: "C", leaderName: "QUELBIS ROMÁN QUINTERO BERTEL" },
  { name: "ZOOLOGIA Y ECOLOGIA DE LA UNIVERSIDAD DE SUCRE", category: "NC", leaderName: "DEIVYS MOISES ALVAREZ GARCIA" },
  { name: "DIDÁCTICA DE LAS CIENCIAS, DIDAK-CIENCIAS", category: "NC", leaderName: "ALBERTO DE JESUS PUPO IRIARTE" },
  { name: "CIENCIAS MEDICAS Y FARMACEUTICAS", category: "NC", leaderName: "NERLIS PAOLA PAJARO CASTRO" },
  { name: "PENSAMIENTO MATEMÁTICO-PEMA", category: "NC", leaderName: "JAIRO ESCORCIA MERCADO" },
  { name: "SODEHUPAZ", category: "NC", leaderName: "OSCAR ANDRÉS DONCEL" },
  { name: "INVESTIGACIÓN E INNOVACIÓN EN AMBIENTE Y SALUD", category: "NC", leaderName: "PEDRO JOSÉ BLANCO TUIRAN" },
  { name: "GIMAGUAS", category: "NC", leaderName: "GUILLERMO GUTIERREZ RIBBON" },
  { name: "GRUPO DE INVESTIGACIÓN E INNOVACIÓN EN ELECTRÓNICA (GINELECT)", category: "NC", leaderName: "RAMON ANTONIO ALVAREZ LOPEZ" },
  { name: "CLINICA EN MEDICINA-GICLIM", category: "NC", leaderName: "EDGAR VERGARA DAGOBETH" }
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const collection = db.collection('researchgroups');

  console.log('SEEDING RESEARCH GROUPS...');

  for (const group of groups) {
    await collection.updateOne(
      { name: group.name },
      { 
        $set: { 
          name: group.name,
          category: group.category,
          leaderName: group.leaderName,
          leaderEmail: "sin_especificar@unisucre.edu.co",
          leaderPhone: "N/A",
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
  }

  console.log('DONE!');
  process.exit(0);
}

seed();
