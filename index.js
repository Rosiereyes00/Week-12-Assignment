class List {
  constructor(listName){
      this.listName = listName;
      this.listOfAllItems = [];
      //add id to list
  }
  addListItem(item, price){
      this.listOfAllItems.push(new Items(item, price));
  }
}

class Items{
  static idCounter = 0;
  constructor(item, price){
      this.item = item;
      this.price = price;
      //add id to item
      this.id = Items.idCounter++;
  }
}

//API calls
//get request
class ListService {
  static url = "https://64092d096ecd4f9e18aa1900.mockapi.io/ShoppingList/";

  static getAllLists() {
      return $.get(this.url);
  }

  static getList(id){
      return $.get(this.url + `/${id}`);
  }

  static createList(listName){
      return $.post(this.url, listName);
  }

  static updateList(list){
          return $.ajax({
          url: this.url + `/${list.id}`,
          dataType: 'json',
          data: JSON.stringify(list),
          contentType: 'application/json',
          type: 'PUT'
      });
  }

  static deleteList(id){ 
      return $.ajax({
          url: this.url + `/${id}`,
          type: 'DELETE'
      });
  }
}

class DOMManager {
  static lists;

  static getAllLists(){ 
       ListService.getAllLists().then(lists => this.render(lists));
  }

  static deleteList(id){
      ListService.deleteList(id)
      .then(() => {
          return ListService.getAllLists();
      })
      .then((lists) => this.render(lists));
  }

  static createList(listName){
      ListService.createList(new List(listName))
      .then(() => {
          return ListService.getAllLists();
      })
      .then((lists) => this.render(lists));
  }

  static addListItem(id){
      for (let list of this.lists){
          if(list.id == id){
              list.listOfAllItems.push(new Items($(`#${list.id}-item-name`).val(), $(`#${list.id}-item-price`).val()));
              ListService.updateList(list)
              .then(() => {
                  return ListService.getAllLists();
              })
              .then((lists) => this.render(lists));
          }
          
      }
  }

  static deleteItem(listId, i){
      const list = this.lists.find((l) => l.id === listId)
      list.listOfAllItems.splice(i, 1);
          ListService.updateList(list)
              .then(() => {
                  return ListService.getAllLists();
              })
              .then((lists) => this.render(lists));
  }

  static render(lists){
      this.lists = lists;
      $('#app').empty();
      for (let list of lists){
          $('#app').prepend(
              `
              <div id="${list.id}" class="card">
                      <div class="card-header bg-success-subtle">
                          <div class="d-flex">
                              <div class="p-2 w-100">
                                  <h2>${list.listName}</h2>
                              </div>
                              <div class="flex-shrink-1">
                                  <button class="btn btn-danger mt-2" onclick="DOMManager.deleteList('${list.id}')">Delete</button>
                              </div>
                          </div>
                      </div>
                      <div class="card-body">
                          <div class="card">
                              <div class="row">
                                  <div class="col-sm">
                                      <input type="text" id="${list.id}-item-name" class="form-control" placeholder="Item Name">
                                  </div>
                                  <div class="col-sm">
                                      <input type="text" id="${list.id}-item-price" class="form-control p-2 mb-2" placeholder="Estimated Item Price">
                                  </div>
                              </div>
                              <button id="${list.id}-new-item" onclick="DOMManager.addListItem('${list.id}')" class="btn btn-outline-success form-control">Add</button>
                          </div>
                      </div>
              </div>
               <br>
              `  
              );

              list.listOfAllItems.forEach((item, i) => {
                  $(`#${list.id}`).find('.card-body').append(
                      `
                      <div class="d-flex">
                          <div class="p-2 w-100 mb-3 fs-5" id="bodyOfList">
                              <div class="row p-2">
                                      <div class="col">
                                          <span id="item-${item.id}"><strong>Item Name: </strong> ${item.item}</span>
                                      </div>
                                      <div class="col">
                                          <span id="price-${item.id}"><strong>Item Price: </strong> ${item.price}</span>                              
                                      </div>
                              </div>
                          </div>
                          <div class="flex-shrink-1">
                              <button id="boo" class="btn btn-danger mb-3 my-2" onclick="DOMManager.deleteItem('${list.id}', ${i})">Delete Item</button>
                          </div>    
                      </div>
                      `
                  )
              })
          }
 }
}

$('#create-new-list').on('click', () => {

  DOMManager.createList($('#new-list-name').val());
  $('#new-list-name').val('');
});

DOMManager.getAllLists();