export default (path, body) => {
  return fetch(path, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      mode: 'cors',
      credentials: 'same-origin',
      body: JSON.stringify(body),
    })
    .then((result)=>{
      return result.json();
    });
  };
