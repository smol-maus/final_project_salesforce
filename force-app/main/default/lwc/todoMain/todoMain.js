import { LightningElement, track, wire} from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import noHeader from '@salesforce/resourceUrl/NoHeader';
import getTodoMap from '@salesforce/apex/TodoController.getTodoMap';

export default class TodoMain extends LightningElement {
    page = 1; 
    startingRecord = 1;
    endingRecord = 0;
    pageSize = 4;
    totalRecountCount = 0;
    totalPage = 0;

    mapData = [];
    wiredResult;

    createMode = false;
    emptyState = true;
    error;

    @track currentData = [];
    @track displayedPage = [];
    currentCategory = 'All';

    @wire(getTodoMap)
    wiredMap(result) {
        this.wiredResult = result;
        this.mapData = [];
        if (result.data) {
            for (let key in result.data) {
                let obj = JSON.parse(key);
                let date = obj.CreatedDate;
                date = date.slice(0,26) + ':' + date.slice(-2); //why
                obj.CreatedDate = date;
                this.mapData.push({value:result.data[key], key:obj});
            }
            this.getByCategory();

            this.totalRecountCount = this.currentData.length;
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
            if (this.totalPage < this.page) {
                this.page = this.totalPage;
            }
            this.displayRecordPerPage(this.page);

            this.emptyCheck();
            
        } else if (result.error) {
            this.error = result.error;
        }
    }

    getByCategory(){
        this.currentData = [];
        if (this.currentCategory == 'All') {
            this.currentData = this.mapData;
            return;
        };
        for (let item of this.mapData) {
            if (item.key.RecordType.Name == this.currentCategory){
                this.currentData.push(item);
            };
        }
    }

    emptyCheck(){
        if (this.currentData.length == 0){
            this.emptyState = true;
        } else {
            this.emptyState = false;
        }
    };

    refresh(){
        if (this.template.querySelector('c-todo-search').currentQuery() != '') {
            return this.template.querySelector('c-todo-search').handleSearch();
        };
        refreshApex(this.wiredResult);
    }

    handleCategory(event){
        this.currentCategory = event.target.value;
        this.getByCategory();
        this.pageReset();
    }

    handleFind(event){
        this.mapData = event.detail;
        this.getByCategory();
        this.pageReset();
    }

    handleCreateState(){
        this.createMode = !this.createMode;
    }

    showSucessToast(message){
        this.refresh();
        this.createMode = false;
        this.dispatchEvent( new ShowToastEvent({
                title: 'Success',
                message: message,
                variant: 'success'
            })
        );
    }

    successEventToast(event){
        this.showSucessToast(event.detail);
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
            {label: 'Expired', value: 'Expired'},
        ];
    }

    displayRecordPerPage(page){
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);
        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.displayedPage = this.currentData.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }

    pageReset(){
        this.emptyCheck();
        this.page = 1;
        this.startingRecord = 1;
        this.endingRecord = this.pageSize;
        this.totalRecountCount = this.currentData.length;
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
        this.displayRecordPerPage(this.page);   
    }

    handlePreviousPage() {
        if (this.page > 1) {
            this.page = this.page - 1;
            this.displayRecordPerPage(this.page);
        }
    }

    handleNextPage() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1;
            this.displayRecordPerPage(this.page);            
        }             
    }

    handleFirstPage() {
        this.page = 1;
        this.displayRecordPerPage(this.page);            
    }

    handleLastPage() {
        this.page = this.totalPage;
        this.displayRecordPerPage(this.page);            
    }

    handleClear() {
        this.currentCategory = 'All';
        this.template.querySelector('c-todo-search').handleReset();
    }

    connectedCallback() {
        loadStyle(this, noHeader);
    }
}