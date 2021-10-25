const container = document.getElementById('content')

const ajaxData = async(page) => {
    var search = document.getElementById('searchInput').value
    container.innerHTML="<div class=\"loader\"></div>" //Petite animation de chargement en attendant la promesse
    const parseJSON = resp => (resp.json ? resp.json() : resp);

    const checkStatus = resp => {
      if (resp.status >= 200 && resp.status < 300) {
        return resp;
      }
      return parseJSON(resp).then(resp => {
        throw resp;
      });
    };
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
        if(search=="") throw "Besoin d\'un élément à chercher"
        var data = await fetch(`https://entreprise.data.gouv.fr/api/sirene/v1/full_text/${search}?page=${page}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        })
          .then(checkStatus)
          .then(parseJSON);
        var beautifuler=`
            <div class='container text-center'>
                <div class='row p-5'>
                    <div class='col'>Siret</div>
                    <div class='col'>Nom</div>
                    <div class='col'>...</div>
                </div>`;
        container.innerHTML=`<p class=\"text-secondary text-center m-3\">Nombre de résultats ${data.total_results} - Page: ${data.page}</p>`
        var counter=0
        data.etablissement.map(entreprise => {    
            var date_entreprise = entreprise.date_creation
            beautifuler+=`<div class="row text-center">
                <div class='col'>${entreprise.siret}</div>
                <div class='col'>${entreprise.nom_raison_sociale}</div>
                <div class='col'><button class='m-3' onclick="infoHandler(this,${counter});">Détails</button></div>
            </div>`
            /* Détails caché */
            +
            `<div class='container' id='info-${counter}' hidden>
                <p>Catégorie entreprise: ${entreprise.categorie_entreprise}</p>
                <p>Créée le: ${date_entreprise.substring(6,8)} - ${date_entreprise.substring(4,6)} - ${date_entreprise.substring(0,4)}</p>
                <p>Adresse: ${entreprise.geo_adresse}</p>
                <p>Activité principale: ${entreprise.libelle_activite_principale}</p>
            </div>`
            counter++
        })
        beautifuler+=`
        <div class="text-secondary">
            ${(data.page!=1)? `
                <p onclick=\"ajaxData(${page-1})\">\<</p>
                <p onclick=\"ajaxData(1);\">1</p> \-
                ` : ''}
            <p>${data.page}</p>
            ${(data.page!=data.total_pages)? `
                \- <p onclick="ajaxData(${data.total_pages})">${data.total_pages}</p>
                <p onclick=\"ajaxData(${page+1})\">\></p>
                ` : ''}
        </div>
        </div>`// Close the content container
        container.innerHTML+=beautifuler
    } catch (error) {
        console.error(error)
        container.innerHTML=`<p class=\"text-center\">Aucune entreprise n'a été trouvé</p>`
    }
}
// Active/Désactive les infos
var infoHandler = (htmlElement,id) => {
    var info = document.getElementById(`info-${id}`)
    info.hidden = !info.hidden
    htmlElement.innerHTML = (info.hidden) ? 'Détails' : 'Moins'
}