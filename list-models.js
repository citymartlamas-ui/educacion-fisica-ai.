const apiKey = "AIzaSyCP6_ODxrSG74OJRH6hxEKTkNecsOqu-r4";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
            console.log("ERROR:", JSON.stringify(data.error, null, 2));
        } else {
            const list = data.models.map(m => m.name);
            console.log("START_LIST");
            list.forEach(m => console.log(m));
            console.log("END_LIST");
        }
    } catch (e) {
        console.log("FETCH ERROR:", e.message);
    }
}

listModels();
