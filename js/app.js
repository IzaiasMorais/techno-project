const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    infos: [],
    carrinho: [],
    produto: false,
    resumo: false,
    added: false,
    msg: ''
  },
  filters: {
    numberPrice(valor) {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
  computed: {
    total() {
      let total = 0;

      if (this.carrinho.length) {
        this.carrinho.forEach((item) => {
          total += item.preco;
        });
      }
      return total;
    },
  },
  methods: {
    fetchProducts() {
      fetch("./api/produtos.json")
        .then((r) => r.json())
        .then((r) => (this.produtos = r));
    },
    fetchProduto(id) {
      fetch(`./api/produtos/${id}/dados.json`)
        .then((r) => r.json())
        .then((r) => (this.produto = r));
    },
    openModal(id) {
      this.fetchProduto(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    closeModal({ target, currentTarget }) {
      if (target === currentTarget) {
        this.produto = !this.produto;
      }
    },
    closeCarrinhoModal({ target, currentTarget }) {
      if (target === currentTarget) {
        this.resumo = !this.resumo;
      }
    },
    addItem() {
      const { id, nome, preco } = this.produto;
      this.carrinho.push({ id, nome, preco });      
      this.produto.estoque--;     

      this.showAlert(`${nome} foi adicionado ao carrinho`)
    },
    removeItem(index) {
      this.carrinho.splice(index, 1);
    },
    openCart() {
      this.resumo = !this.resumo;
      console.log('Cart is open');
    },
    checkWindowStorage() {
      if (window.localStorage.carrinho) {
        this.carrinho = JSON.parse(window.localStorage.carrinho);
      }
      if (window.localStorage.total) {
        this.total = JSON.parse(window.localStorage.total);
      }
    },
    showAlert(mensage) {
      this.msg = mensage;
      this.added = true;
      setTimeout(() => {
        this.added = false;
      }, 1000)
    },
    router() {
      const hash = document.location.hash;
      if (hash) {
        this.fetchProduto(hash.replace('#', ''));
      }
    },
    compareStock() {
      const items = this.carrinho.filter((i) => {
        if(i.id === this.produto.id) {
          return true;
        }
      })
      this.produto.estoque = this.produto.estoque - items.length;
    }
  },  
  watch: {
    produto() {
      document.title = this.produto.nome || 'Techno';
      const hash = this.produto.id || ''
      history.pushState(null, null, `#${hash}`)

      if(this.produto) {
        this.compareStock();
      }
    },
    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho);
    },
    total() {
      window.localStorage.total = JSON.stringify(this.total);
    }
  },
  created() {
    this.fetchProducts();
    this.checkWindowStorage();    
  },
});
