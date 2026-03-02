const sdk = require('node-appwrite');
const fs = require('fs');
const csv = require('csv-parser');

const client = new sdk.Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') 
    .setProject('69a5b79700310daf30ec')              
    .setKey('standard_e33401feb59e51f70456c883807ad015debf79329b2ad28536cbb9218fa62b1b90b1d67c9a681ce629e67d7d034439177afc46872bff3d35b565c983af252657f256326b4dbc1e9b33ff8a41e8ed46774ad4655641a4ec88b8fd7560150bd071140ee0e81a4c58037f052273e597405fd7c567712cbd2bbffec61f0d872cad44'); 

const databases = new sdk.Databases(client);
const dbId = '69a5ba710004207bb5a9'; 

async function importarCSV(nombreArchivo, coleccionId) {
    console.log(`Iniciando carga de: ${nombreArchivo}...`);
    fs.createReadStream(nombreArchivo)
        .pipe(csv())
        .on('data', async (row) => {
            try {
                // LIMPIEZA DE DATOS: 
                // 1. Quitamos 'created_at' porque da error de "Unknown attribute"
                // 2. Extraemos el 'id' del CSV para usarlo como ID del documento oficial
                const { id, created_at, ...datosLimpios } = row; 

                // Si el ID del CSV existe, lo usamos. Si no, generamos uno único.
                const documentId = id && id !== "" ? id : sdk.ID.unique();

                await databases.createDocument(
                    dbId, 
                    coleccionId, 
                    documentId, 
                    datosLimpios
                );
            } catch (error) {
                console.error(`❌ Error en ${coleccionId}: ${error.message}`);
            }
        })
        .on('end', () => console.log(`✅ Finalizada la lectura de ${nombreArchivo}`));
}

// Ejecución de la importación
importarCSV('data/products_rows.csv', 'products');
importarCSV('data/categories_rows.csv', 'categories');
importarCSV('data/top_bar_messages_rows.csv', 'top_bar_messages');
importarCSV('data/hero_slides_rows.csv', 'hero_slides');
importarCSV('data/store_settings_rows.csv', 'store_settings');
importarCSV('data/profiles_rows.csv', 'profiles');
importarCSV('data/wishlist_rows.csv', 'wishlist');