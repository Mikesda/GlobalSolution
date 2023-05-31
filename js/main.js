const form = document.getElementById("novoItem")
const lista = document.getElementById("lista")
const itens = JSON.parse(localStorage.getItem("itens")) || []

itens.forEach( (elemento) => {
    criaElemento(elemento)
} )

form.addEventListener("submit", (evento) => {
    evento.preventDefault()

    const nome = evento.target.elements['nome']
    const valor = evento.target.elements['valor']

    const valorFormatado =  valor.value.replace(",", ".");
    const existe = itens.find( elemento => elemento.nome === nome.value )

    const itemAtual = {
        "nome": nome.value,
        "valor": valorFormatado
    }

    if (existe) {
        itemAtual.id = existe.id
        
        atualizaElemento(itemAtual)

        itens[itens.findIndex(elemento => elemento.id === existe.id)] = itemAtual
    } else {
        itemAtual.id = itens[itens.length -1] ? (itens[itens.length-1]).id + 1 : 0;

        criaElemento(itemAtual)

        itens.push(itemAtual)
    }

    localStorage.setItem("itens", JSON.stringify(itens))

    nome.value = ""
    valor.value = ""
})

function criaElemento(item) {
    const novoItem = document.createElement("li")
    novoItem.classList.add("item")

    const numeroItem = document.createElement("strong")
    // numeroItem.innerHTML = "R$" + item.valor.toLowerCase()
    const valor = item.valor
    const valorFormatado =  valor.replace(",", ".");
    numeroItem.innerHTML = "R$" + valorFormatado
    numeroItem.dataset.id = item.id
    novoItem.appendChild(numeroItem)
        
    // novoItem.innerHTML += item.nome.toLowerCase()
    novoItem.innerHTML += item.nome

    

    //Deleta o item criado
    novoItem.appendChild(botaoDeleta(item.id))

    // Adicione classes ao elemento <li> para filtragem
    if (item.nome) {
        // novoItem.classList.add(item.nome.toLowerCase());
        novoItem.classList.add(item.nome.toLowerCase().replace(/\s+/g, '-'));

    }
    if (item.valor) {
         novoItem.classList.add(valorFormatado.toLowerCase());
    }
    calcularTotalGasto(); // Atualiza o valor total
    analisarConsumo(); // Atualiza a análise de consumo
    lista.appendChild(novoItem)
}

function atualizaElemento(item) {
    document.querySelector("[data-id='"+item.id+"']").innerHTML = item.valor
}

function botaoDeleta(id) {
    const elementoBotao = document.createElement("button")
    elementoBotao.innerText = "X"

    elementoBotao.addEventListener("click", function() {
        deletaElemento(this.parentNode, id)
    })

    return elementoBotao
}

function deletaElemento(tag, id) {
    tag.remove()

    itens.splice(itens.findIndex(elemento => elemento.id === id), 1)

    localStorage.setItem("itens", JSON.stringify(itens))

    calcularTotalGasto(); // Atualiza o valor total
    analisarConsumo(); // Atualiza a análise de consumo
}

//Filtro
const filtroInput = document.getElementById("filtro");

filtroInput.addEventListener("input", function () {
    const filtroValor = filtroInput.value.toLowerCase();

    const itensLista = document.querySelectorAll(".lista .item");

    itensLista.forEach(function (item) {
        const nomeItem = item.classList.contains("item") ? item.classList.item(1) : "";
        const valorItem = item.classList.contains("item") ? item.classList.item(2) : "";

        if (nomeItem.includes(filtroValor) || valorItem.includes(filtroValor)) {
            item.style.display = "block"; // Mostra o item
        } else {
            item.style.display = "none"; // Oculta o item
        }
    });
});

//Análise de consumo
const btnAnalise = document.getElementById("btnAnalise");
btnAnalise.addEventListener("click", mostrarAnaliseConsumo);

function mostrarAnaliseConsumo() {
    const analiseSection = document.getElementById("analiseSection");
    analiseSection.style.display = "block";
  
    //Rolagem de forma suave
    analiseSection.scrollIntoView({ behavior: "smooth" });

    calcularTotalGasto();
    analisarConsumo();
}

function calcularTotalGasto() {
    const totalGastoElement = document.getElementById("totalGasto");

    const total = itens.reduce((total, item) => total + parseFloat(item.valor), 0);
    totalGastoElement.innerHTML = `Total Gasto: R$ ${total.toFixed(2)}`;
}

function analisarConsumo() {
    const analiseConsumoElement = document.getElementById("analiseConsumo");

    analiseConsumoElement.innerHTML = "Análise de Consumo";
}
