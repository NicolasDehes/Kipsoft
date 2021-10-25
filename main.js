const container = document.getElementById('content')

const ajaxData = async(page, state) => {
    var search = document.getElementById('searchInput').value
    search = (state==="siret")? "siret/"+search : "full_text/"+search 
    container.innerHTML="<div class=\"loader\"></div>" //Petite animation de chargement en attendant la promesse
    const parseJSON = resp => (resp.json ? resp.json() : resp);

    const checkStatus = resp => {
      if (resp.status >= 200 && resp.status < 300) {
        return resp;
      }
      if (resp.status === 404){
          throw "Aucune entreprise trouvée"
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
        var data = await fetch(`https://entreprise.data.gouv.fr/api/sirene/v1/${search}?page=${page}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        })
          .then(checkStatus)
          .then(parseJSON);
        container.innerHTML=`<p class=\"text-secondary text-center m-3\">Nombre de résultats ${data.total_results} - Page: ${data.page}</p>`
        var beautifuler=`
            <div class='container text-center border border-primary'>
                <div class='row p-3 border-primary border-bottom'>
                    <div class='col'>Siret</div>
                    <div class='col'>Nom</div>
                    <div class='col'>...</div>
                </div>`;
        if(state=="nom"){
            var counter=0
            data.etablissement.map(entreprise => {    
                var date_entreprise = entreprise.date_creation
                beautifuler+=`<div class="row text-center pt-2">
                    <div class='col'>${entreprise.siret}</div>
                    <div class='col'>${entreprise.nom_raison_sociale}</div>
                    <div class='col'><button class='m-auto btn btn-outline-info' onclick="infoHandler(this,${counter});">Détails</button></div>
                </div>`
                /* Détails caché */
                +
                `<div class='container border border-info mt-1' id='info-${counter}' hidden>
                    <p>Catégorie entreprise: ${entreprise.categorie_entreprise}</p>
                    <p>Créée le: ${date_entreprise.substring(6,8)} - ${date_entreprise.substring(4,6)} - ${date_entreprise.substring(0,4)}</p>
                    <p>Adresse: ${entreprise.geo_adresse}</p>
                    <p>Activité principale: ${entreprise.libelle_activite_principale}</p>
                </div>`
                counter++
            })
        } else {
            var entreprise = data.etablissement
            var date_entreprise = entreprise.date_creation
            beautifuler+=`<div class="row text-center pt-2">
                <div class='col'>${entreprise.siret}</div>
                <div class='col'>${entreprise.nom_raison_sociale}</div>
                <div class='col'><button class='m-auto btn btn-outline-info' onclick="infoHandler(this,${counter});">Détails</button></div>
            </div>`
            /* Détails caché */
            +
            `<div class='container border border-info mt-1' id='info-${counter}' hidden>
                <p>Catégorie entreprise: ${entreprise.categorie_entreprise}</p>
                <p>Créée le: ${date_entreprise.substring(6,8)} - ${date_entreprise.substring(4,6)} - ${date_entreprise.substring(0,4)}</p>
                <p>Adresse: ${entreprise.geo_adresse}</p>
                <p>Activité principale: ${entreprise.libelle_activite_principale}</p>
            </div>`
        }
        if(state=="nom"){
                beautifuler+=`
            <div class="text-secondary border-top border-primary mt-1">
                ${(data.page!=1)? `
                    <p class="d-inline-block" onclick=\"ajaxData(${page-1})\">\<</p>
                    <p class="d-inline-block" onclick=\"ajaxData(1);\">1</p> \-
                    ` : ''}
                <p class="d-inline-block text-dark">${data.page}</p>
                ${(data.page!=data.total_pages)? `
                    \- <p class="d-inline-block" onclick="ajaxData(${data.total_pages})">${data.total_pages}</p>
                    <p class="d-inline-block" onclick=\"ajaxData(${page+1})\">\></p>
                    ` : ''}
            </div>`
        }
        beautifuler+='</div>'// Close the content container
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