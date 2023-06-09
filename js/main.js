const form = document.getElementById("novoItem");
const lista = document.getElementById("lista");
const itens = JSON.parse(localStorage.getItem("itens")) || [];

itens.forEach((elemento) => {
  criaElemento(elemento);
});

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nome = evento.target.elements["nome"];
  const valor = evento.target.elements["valor"];

  const valorFormatado = valor.value.replace(",", ".");
  const existe = itens.find((elemento) => elemento.nome === nome.value);

  if (nome.value && valor.value) {
    if (nome.value.length > 20) {
      // Se o nome da conta ultrapassar o limite de 20 caracteres, exibir uma mensagem de erro.
      alert("O campo 'Nome' deve ter no máximo 20 caracteres.");
      return;
    }

    // Verificar se o valor possui apenas números, "," e "."
    const valorRegex = /^[\d.,]+$/;
    if (!valorRegex.test(valor.value)) {
      // Valor inválido, exiba uma mensagem de erro.
      alert("O campo 'Valor' deve conter apenas números, ',' e '.'.");
      return;
    }

    if (existe) {
      // Nome de conta já existe, exiba uma mensagem de erro.
      alert("Nome de conta já cadastrada.");
    } else {
      const itemAtual = {
        nome: nome.value,
        valor: valorFormatado,
      };

      if (existe) {
        itemAtual.id = existe.id;

        atualizaElemento(itemAtual);

        itens[itens.findIndex((elemento) => elemento.id === existe.id)] =
          itemAtual;
      } else {
        itemAtual.id = itens[itens.length - 1]
          ? itens[itens.length - 1].id + 1
          : 0;

        criaElemento(itemAtual);

        itens.push(itemAtual);
      }

      localStorage.setItem("itens", JSON.stringify(itens));

      nome.value = "";
      valor.value = "";

      calcularTotalGasto();
      calcularMedia();
      analisarConsumo();
      gerarGrafico();
    }
  } else {
    // Campos nome e valor não estão preenchidos, exiba uma mensagem de erro.
    alert("Por favor, preencha tanto o campo 'Nome' quanto o campo 'Valor'.");
  }
});

function criaElemento(item) {
  const novoItem = document.createElement("li");
  novoItem.classList.add("item");

  const numeroItem = document.createElement("strong");
  const valor = item.valor;
  const valorFormatado = valor.replace(",", ".");
  const valorFormatadoComDuasCasasDecimais =
    parseFloat(valorFormatado).toFixed(2);
  numeroItem.innerHTML = "R$" + valorFormatadoComDuasCasasDecimais;
  numeroItem.dataset.id = item.id;
  novoItem.appendChild(numeroItem);

  novoItem.innerHTML += item.nome;

  // Deleta o item criado
  novoItem.appendChild(botaoDeleta(item.id));

  // Adicione classes ao elemento <li> para filtragem
  if (item.nome) {
    novoItem.classList.add(item.nome.toLowerCase().replace(/\s+/g, "-"));
  }
  if (item.valor) {
    novoItem.classList.add(valorFormatado.toLowerCase());
  }

  lista.appendChild(novoItem);
}

function atualizaElemento(item) {
  document.querySelector("[data-id='" + item.id + "']").innerHTML = item.valor;
}

function botaoDeleta(id) {
  const elementoBotao = document.createElement("button");
  elementoBotao.innerText = "X";

  elementoBotao.addEventListener("click", function () {
    if (confirm("Tem certeza que deseja excluir esta conta ?")) {
      deletaElemento(this.parentNode, id);
    }
  });

  return elementoBotao;
}

function deletaElemento(tag, id) {
  tag.remove();

  itens.splice(
    itens.findIndex((elemento) => elemento.id === id),
    1
  );

  localStorage.setItem("itens", JSON.stringify(itens));

  calcularTotalGasto(); // Atualiza o valor total
  calcularMedia(); // Atualiza a media
  analisarConsumo(); // Atualiza a análise de consumo
  gerarGrafico();
}

//Filtro
const filtroInput = document.getElementById("filtro");

filtroInput.addEventListener("input", function () {
  const filtroValor = filtroInput.value.toLowerCase();

  const itensLista = document.querySelectorAll(".lista .item");

  itensLista.forEach(function (item) {
    const nomeItem = item.classList.contains("item")
      ? item.classList.item(1)
      : "";
    const valorItem = item.classList.contains("item")
      ? item.classList.item(2)
      : "";

    if (nomeItem.includes(filtroValor) || valorItem.includes(filtroValor)) {
      item.style.display = "block"; // Mostra o item
    } else {
      item.style.display = "none"; // Oculta o item
    }
  });
});

const btnAnalise = document.getElementById("btnAnalise");
btnAnalise.addEventListener("click", toggleAnaliseConsumo);

function toggleAnaliseConsumo() {
  const analiseSection = document.getElementById("analiseSection");

  // Verifica o estado atual da seção de análise
  if (analiseSection.style.display === "block") {
    analiseSection.style.display = "none";
    btnAnalise.textContent = "Mostrar Análise";
  } else {
    analiseSection.style.display = "block";
    btnAnalise.textContent = "Ocultar Análise";

    //Rolagem de forma suave
    analiseSection.scrollIntoView({ behavior: "smooth" });

    calcularTotalGasto();
    analisarConsumo();
    gerarGrafico();
    calcularMedia();
  }
}

function gerarGrafico() {
  const ctx = document.getElementById("grafico").getContext("2d");
  const valores = itens.map((item) => parseFloat(item.valor));
  const nomes = itens.map((item) => item.nome);

  const data = {
    labels: nomes,
    datasets: [
      {
        label: "Consumo",
        data: valores,
        backgroundColor: "rgba(25, 147, 104, 0.75)",
        borderColor: "rgba(25, 147, 104, 1)",
        borderWidth: 1,
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "R$ " + value;
            },
          },
        },
      },
      color: "black",
    },
  };

  let chartStatus = Chart.getChart("grafico");
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }

  new Chart(ctx, config);
}

function calcularTotalGasto() {
  const totalGastoElement = document.getElementById("totalGasto");

  const total = itens.reduce(
    (total, item) => total + parseFloat(item.valor),
    0
  );
  totalGastoElement.innerHTML = `Total Gasto: R$ ${total.toFixed(2)}`;
}

function calcularMedia() {
  const mediaElement = document.getElementById("mediaGasto");

  const total = itens.reduce(
    (total, item) => total + parseFloat(item.valor),
    0
  );
  const mean = total / itens.length;

  mediaElement.innerHTML = `Média de Gasto por Conta: R$ ${mean.toFixed(2)}`;
}

function analisarConsumo() {
  const analiseConsumoElement = document.getElementById("analiseConsumo");

  analiseConsumoElement.innerHTML = "Análise de Consumo";
}
