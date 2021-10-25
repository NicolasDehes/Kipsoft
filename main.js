const container = document.getElementById('content')

const ajaxData = async(search) => {
    container.innerHTML="<div class=\"loader\"></div>"
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
        var data = await fetch(`https://entreprise.data.gouv.fr/api/sirene/v1/full_text/${search}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        })
          .then(checkStatus)
          .then(parseJSON);
        var beautifuler;
        container.innerHTML=`<p class=\"text-secondary text-center m-3\">${data.total_results}</p>`
        console.log(data)
    } catch (error) {
        console.error(error)
        container.innerHTML=`<p class=\"text-center\">Aucune entreprise n'a été trouvé</p>`
    }
}