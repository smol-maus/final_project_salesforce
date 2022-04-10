import { LightningElement, track, wire} from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import noHeader from '@salesforce/resourceUrl/NoHeader';
import getTodoMap from '@salesforce/apex/TodoController.getTodoMap';
import getRecordTypes from '@salesforce/apex/TodoController.getRecordTypes';

export default class TodoMain extends LightningElement {

    page = 1;
    startingRecord = 1;
    endingRecord = 0;
    pageSize = 4;
    totalRecountCount = 0;
    totalPage = 0;

    widthOutput = window.innerWidth;
    currentCategory = 'All';
    isSearched = false;
    createState = false;
    emptyState = true;
    recordTypes = [];
    error;

    wiredResult;
    coreData = [];
    filteredData = [];
    displayedData = [];
    @track displayedPage = [];

    @wire(getTodoMap)
    wiredMap(result) {
        this.wiredResult = result;
        this.coreData = [];
        if (result.data) {
            for (let key in result.data) {
                let obj = JSON.parse(key);
                let date = obj.CreatedDate;
                date = date.slice(0,26) + ':' + date.slice(-2); //why
                obj.CreatedDate = date;
                this.coreData.push({value:result.data[key], key:obj});
            }
            this.pageResetAndFilter();
        } else if (result.error) {
            this.emptyState = true;
            this.error = result.error;
        }
    }

    filterData(){
        if (this.isSearched) {
            this.filteredData = this.template.querySelector('c-todo-search').search(this.coreData);
        } else {
            this.filteredData = this.coreData;
        }

        this.displayedData = [];
        if (this.currentCategory == 'All') {
            this.displayedData = this.filteredData;
            return;
        };
        for (let item of this.filteredData) {
            if (item.key.RecordType.Name == this.currentCategory){
                this.displayedData.push(item);
            };
        }
    }

    updateTodo(event){
        for (let i = 0; i < this.coreData.length; i++) {
            if (this.coreData[i].key.Id == event.detail.key.Id) {
                this.coreData.splice(i, 1, event.detail);
                break;
            }
        }
        this.filterData();
        this.displayPage();
        this.showSucessToast('Updated');
    }

    createTodo(event) {
        this.coreData.unshift({value:null, key:event.detail});
        this.handleCreateState();
        this.template.querySelector('c-todo-search').handleReset();
        this.showSucessToast('Created!');
    }

    deleteTodo(event) {
        for (let i = 0; i < this.coreData.length; i++) {
            if (this.coreData[i].key.Id == event.detail) {
                this.coreData.splice(i, 1);
                break;
            }
        }
        this.filterData();
        this.displayPage();
        this.showSucessToast('Todo deleted');
    }

    emptyCheck(){
        if (this.displayedData.length == 0){
            this.emptyState = true;
        } else {
            this.emptyState = false;
        }
    };

    refresh(){
        this.isSearched = false;
        refreshApex(this.wiredResult);
    }

    showSucessToast(message){
        this.dispatchEvent( new ShowToastEvent({
                title: 'Success',
                message: message,
                variant: 'success'
            })
        );
    }

    get pageInfo() {
        return 'Page ' + this.page + '/' + this.totalPage;
    };
    
    get categoryList(){
        return [
            {label: 'All', value: 'All'},
            {label: 'Today', value: 'Today'},
            {label: 'Tomorrow', value: 'Tomorrow'},
            {label: 'Later', value: 'Later'},
            //{label: 'Expired', value: 'Expired'},
        ];
    }

    get cardSize() {
        if(this.widthOutput < 790){
            return 6;
        } else if (this.widthOutput < 1000) {
            return 4;
        }
        return 3;
    }

    handleCreateState(){
        this.createState = !this.createState;
    }

    handleCategory(event){
        this.currentCategory = event.target.value;
        this.pageResetAndFilter();
    }

    handleFind() {
        this.isSearched = true;
        this.pageResetAndFilter();
    }

    handleFindReset() {
        this.isSearched = false;
        this.pageResetAndFilter();
    }

    handleClearParameters() {
        this.currentCategory = 'All';
        this.template.querySelector('c-todo-search').handleReset();
    }

    pageResetAndFilter(){
        this.filterData();
        this.page = 1;
        this.startingRecord = 1;
        this.endingRecord = this.pageSize;
        this.displayPage();   
    }

    displayPage(){
        this.totalRecountCount = this.displayedData.length;
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
        if (this.totalPage < this.page) {
            this.page = this.totalPage;
        } //если последний элемент на странице удален, перейти на предыдущую

        this.startingRecord = ((this.page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * this.page);
        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.displayedPage = this.displayedData.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
        this.emptyCheck();
    }

    handlePreviousPage() {
        if (this.page > 1) {
            this.page = this.page - 1;
            this.displayPage();
        }
    }

    handleNextPage() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1;
            this.displayPage();            
        }             
    }

    handleFirstPage() {
        this.page = 1;
        this.displayPage();            
    }

    handleLastPage() {
        this.page = this.totalPage;
        this.displayPage();            
    }

    resizeListener = () => {
        this.widthOutput = window.innerWidth;
    };

    connectedCallback() {
        window.addEventListener('resize', this.resizeListener);
        loadStyle(this, noHeader);

        getRecordTypes()
            .then((result) => {
                for (let key in result) {
                    this.recordTypes.push({label:key, value:result[key]});
                }
            })
            .catch((error) => {
                alert(error);
            });
    }

}