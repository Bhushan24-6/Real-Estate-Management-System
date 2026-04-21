function loadProperties(){

fetch("http://localhost:5000/properties")

.then(res => res.json())

.then(data => {

let output="";

data.forEach(p => {

output+=`

<tr>

<td>${p.Property_ID}</td>
<td>${p.Property_Type}</td>
<td>${p.Area}</td>
<td>${p.Price}</td>
<td>${p.Status}</td>

</tr>

`;

});

document.getElementById("propertyTable").innerHTML=output;

});

}