class BudgetApp {
  constructor() {
    this.switchInput = null;
    this.descriptionInput = null;
    this.valueInput = null;
    this.enterButton = null;
    this.bilansList = null;
    this.bilansListIncomes = null;
    this.bilansListExpenses = null;
    this.itemDesc = null;
    this.itemValue = null;
    this.totalBudgetInfo = null;
    this.editButton = null;
    this.deleteButton = null;
    this.listItem = null;

    this.numberOfItems = 1;

    this.currency = 'PLN';
    this.bilansItems = [];
    this.totalBudget = 0;
    this.editedItem = null;
  }

  initializeApp() {
    this.switchInput = document.querySelector('.switch__input');
    this.descriptionInput = document.querySelector('#description');
    this.valueInput = document.querySelector('#value');
    this.enterButton = document.querySelector('.button');
    this.bilansList = document.querySelector('.bilans__list');
    this.bilansListIncomes = document.querySelector('#bilans-incomes');
    this.bilansListExpenses = document.querySelector('#bilans-expenses');
    this.itemDesc = document.querySelector('.item__desc');
    this.itemValue = document.querySelector('.item__value');
    this.totalBudgetInfo = document.querySelector('.bilans__title');
    this.editButton = document.querySelector('#edit-button');
    this.deleteButton = document.querySelector('#delete-button');
    this.error = document.querySelector('.error');
    this.listItem = document.querySelector('.list__item');
    this.getLocalStorage();
    this.bilansItems.forEach((item) => {
      item.isPlus
        ? this.bilansListIncomes.insertAdjacentHTML(
            'beforeend',
            this.createItem(item.id, item.isPlus, item.value, item.description)
          )
        : this.bilansListExpenses.insertAdjacentHTML(
            'beforeend',
            this.createItem(item.id, item.isPlus, item.value, item.description)
          );
    });
    this.updateTotalBudget();
    this.addEventListeners();
  }

  listClickHandler(target) {
    if (target.textContent === 'Edytuj') {
      this.getListElement(target);
      this.editItem(target);
    }
    if (target.textContent === 'Usuń') {
      this.getListElement(target);
      this.deleteItem(target);
    }
  }

  getListElement(target) {
    const listElement = target.parentElement.parentElement;
    const listElementId = listElement.id;
    return { element: listElement, id: listElementId };
  }

  getInputValues() {
    const value = this.valueInput.value;
    const description = this.descriptionInput.value;
    const isPlus = !this.switchInput.checked;

    if (value > 0 && description) {
      return {
        id: this.editedItem ? `${this.editedItem.id}` : `${this.numberOfItems}`,
        isPlus,
        value,
        description,
      };
    }
    alert('Podana wartość musi być większa niż 0. Nie oszukuj!');
    throw Error('Nie mozesz podac minusowej wartosci');
  }

  deleteItem(target) {
    const { element, id } = this.getListElement(target);
    const items = [...this.bilansItems];
    element.remove();
    this.bilansItems = items.filter((item) => item.id !== id);
    this.updateTotalBudget();
    this.setLocalStorage();
  }

  editItem(target) {
    const { element, id } = this.getListElement(target);
    this.editedItem = element;
    const selectedElement = this.bilansItems.find((item) => item.id === id);
    this.descriptionInput.value = selectedElement.description;
    this.valueInput.value = selectedElement.value;
    this.switchInput.checked = !selectedElement.isPlus;
  }

  addItem() {
    const newItem = this.getInputValues();
    if (!newItem) {
      this.showError();
    } else {
      this.hideError();
    }
    if (this.editedItem) {
      this.updateItem();
      return;
    }

    const isNotChecked = !this.switchInput.checked;

    const element = isNotChecked
      ? this.bilansListIncomes
      : this.bilansListExpenses;

    this.bilansItems.push(newItem);

    element.insertAdjacentHTML(
      'beforeend',
      this.createItem(
        newItem.id,
        newItem.isPlus,
        newItem.value,
        newItem.description
      )
    );
    this.resetInputsValue();
    this.updateTotalBudget();
    this.setLocalStorage();
    this.numberOfItems++;
  }

  createItem(id, isPlus, value, desc) {
    return `
    <li class="list__item" id="${id}">
    <p class="item__desc">
     ${desc}
    </p>
    <p class="item__value ${
      isPlus ? 'item__value--incomes' : 'item__value--expenses'
    }">${this.formatPrice(parseFloat(value), isPlus)}</p>
    <div class="item__buttons">
      <button class="item__button">Edytuj</button>
      <button class="item__button" id="delete-button">Usuń</button>
    </div>
  </li>
  `;
  }

  resetInputsValue() {
    this.descriptionInput.value = '';
    this.valueInput.value = '';
    this.switchInput.checked = true;
  }

  addEventListeners() {
    this.enterButton.addEventListener('click', () => this.addItem());
    document.addEventListener('keyup', (e) => {
      if (e.keyCode === 13) {
        this.addItem();
      }
    });
    this.descriptionInput.addEventListener('blur', () => this.hideError());
    this.valueInput.addEventListener('blur', () => this.hideError());
    this.bilansList.addEventListener('click', (e) => {
      this.listClickHandler(e.target);
    });
  }

  showError() {
    this.error.classList.remove('hide');
  }
  hideError() {
    this.error.classList.add('hide');
  }

  formatPrice(value, isPositive) {
    return `${isPositive ? '+' : '-'}${this.setNumberOfDigits(value, 2)} ${
      this.currency
    }`;
  }

  setNumberOfDigits(number, digits) {
    return number.toFixed(digits);
  }

  updateTotalBudget() {
    this.totalBudget = 0;
    this.bilansItems.forEach(({ isPlus, value }) => {
      isPlus
        ? (this.totalBudget += parseFloat(value))
        : (this.totalBudget -= parseFloat(value));
    });

    this.totalBudgetInfo.innerHTML = `Twój budżet to: ${this.formatPrice(
      Math.abs(this.totalBudget),
      this.totalBudget >= 0 ? true : false
    )}`;
  }

  updateItem() {
    const items = [...this.bilansItems];
    let willBeupdated = true;
    items.forEach((item) => {
      if (item.id === this.editedItem.id) {
        if (item.isPlus === !this.switchInput.checked) {
          item.value = this.valueInput.value;
          item.description = this.descriptionInput.value;
        } else {
          this.deleteItem(this.editedItem.querySelector('#delete-button'));
          this.editedItem = null;
          this.addItem();
          willBeupdated = false;
        }
      }
    });
    if (!willBeupdated) {
      return;
    }
    this.bilansItems = items;
    this.editedItem.querySelector(
      '.item__desc'
    ).textContent = this.descriptionInput.value;
    this.editedItem.querySelector(
      '.item__value'
    ).textContent = this.formatPrice(
      parseFloat(this.valueInput.value),
      !this.switchInput.checked
    );
    this.updateTotalBudget();
    this.resetInputsValue();
    this.setLocalStorage();
  }

  setLocalStorage() {
    localStorage.setItem('bilansItems', JSON.stringify(this.bilansItems));
    localStorage.setItem('numberOfItems', JSON.stringify(this.numberOfItems));
  }
  getLocalStorage() {
    this.bilansItems = localStorage.getItem('bilansItems')
      ? JSON.parse(localStorage.getItem('bilansItems'))
      : [];
    this.numberOfItems = localStorage.getItem('numberOfItems')
      ? JSON.parse(localStorage.getItem('numberOfItems'))
      : 0;
  }
}

const app = new BudgetApp();
app.initializeApp();
